import { NextResponse } from "next/server";
import { getChatGPTUser, isAdminEmail } from "../../chatgpt-auth";
import { notifyBookingStatus, notifyNewBooking } from "../../lib/email";
import { syncBookingToNotion } from "../../lib/notion";
import { ensureDatabase } from "../../../db/runtime";
import {
  ensureCouponSchema,
  validateCoupon,
  type CouponItem,
} from "../../lib/coupons";

type BookingRow = {
  reference: string;
  customer_name: string;
  email: string;
  phone: string;
  tour_slug: string;
  tour_date: string;
  quantity: number;
  price_mode: string;
  total: number;
  status: string;
  payment_method: string;
  admin_notes?: string | null;
  notion_page_id?: string | null;
};
const allowedStatuses = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
  "cancellation_requested",
];
async function legacyPost(request: Request) {
  const body = (await request.json()) as Record<string, unknown>;
  const required = [
    "tourSlug",
    "customerName",
    "email",
    "phone",
    "tourDate",
    "quantity",
    "priceMode",
    "total",
  ];
  if (required.some((key) => !body[key]))
    return NextResponse.json(
      { error: "Completa todos los campos." },
      { status: 400 },
    );
  const db = await ensureDatabase();
  await ensureCouponSchema(db);
  const user = await getChatGPTUser();
  const now = new Date().toISOString();
  const email = String(body.email ?? "")
    .trim()
    .toLowerCase();
  if (!user) {
    const existing = await db
      .prepare(
        "SELECT user_id FROM user_profiles WHERE email=? AND deleted_at IS NULL LIMIT 1",
      )
      .bind(email)
      .first();
    if (existing)
      return NextResponse.json(
        {
          error:
            "Este correo ya tiene una cuenta. Inicia sesión para continuar con tu pedido.",
        },
        { status: 409 },
      );
  }
  const itemSubtotal = Math.max(0, Number(body.total || 0));
  const cartItems = (
    Array.isArray(body.cartItems)
      ? body.cartItems
      : [{ tourSlug: String(body.tourSlug), total: itemSubtotal }]
  ) as CouponItem[];
  const couponCode = String(body.couponCode ?? "").trim();
  const checkoutKey = String(body.checkoutKey ?? crypto.randomUUID());
  const coupon = couponCode
    ? await validateCoupon(db, {
        code: couponCode,
        items: cartItems,
        email,
        userId: user?.userId,
        checkoutKey,
      })
    : null;
  if (coupon && !coupon.valid)
    return NextResponse.json({ error: coupon.error }, { status: 400 });
  const itemDiscount =
    coupon?.valid && coupon.eligibleSlugs.has(String(body.tourSlug))
      ? Math.round(
          coupon.discount * (itemSubtotal / coupon.eligibleSubtotal) * 100,
        ) / 100
      : 0;
  const finalTotal = Math.max(
    0,
    Math.round((itemSubtotal - itemDiscount) * 100) / 100,
  );
  const reference = `BO-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().slice(0, 4).toUpperCase()}`;
  await db
    .prepare(
      `INSERT INTO bookings (reference,user_id,tour_slug,customer_name,email,phone,tour_date,quantity,price_mode,total,payment_method,payment_reference,coupon_code,discount_amount,cart_subtotal,checkout_key,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    )
    .bind(
      reference,
      user?.userId ?? null,
      String(body.tourSlug),
      String(body.customerName),
      String(body.email),
      String(body.phone),
      String(body.tourDate),
      Number(body.quantity),
      String(body.priceMode),
      finalTotal,
      String(body.paymentMethod ?? "cash"),
      String(body.paymentReference ?? ""),
      coupon?.valid ? coupon.code : null,
      itemDiscount,
      coupon?.valid ? coupon.cartSubtotal : itemSubtotal,
      checkoutKey,
      "pending",
      now,
      now,
    )
    .run();
  if (coupon?.valid)
    await db
      .prepare(
        `INSERT OR IGNORE INTO coupon_redemptions (coupon_id,checkout_key,booking_reference,user_id,email,discount_amount,created_at) VALUES (?,?,?,?,?,?,?)`,
      )
      .bind(
        coupon.coupon.id,
        checkoutKey,
        reference,
        user?.userId ?? null,
        email,
        coupon.discount,
        now,
      )
      .run();
  const method = String(body.paymentMethod ?? "cash");
  await db
    .prepare(
      `INSERT INTO booking_status_history (booking_reference,status,note,changed_by,created_at) VALUES (?,?,?,?,?)`,
    )
    .bind(
      reference,
      "pending",
      method === "cash"
        ? "Pedido creado"
        : method === "paypal"
          ? "Pago con PayPal registrado — pendiente de verificación"
          : "Pago con tarjeta registrado (Paguelo) — pendiente de verificación",
      user?.email ?? String(body.email),
      now,
    )
    .run();
  const order = (await db
    .prepare("SELECT * FROM bookings WHERE reference=?")
    .bind(reference)
    .first()) as BookingRow | null;
  if (order) {
    await notifyNewBooking(db, order);
    const pageId = await syncBookingToNotion(order);
    if (pageId && !order.notion_page_id)
      await db
        .prepare("UPDATE bookings SET notion_page_id=? WHERE reference=?")
        .bind(pageId, order.reference)
        .run();
  }
  return NextResponse.json({
    ok: true,
    reference,
    order,
    message:
      method === "cash"
        ? "Reserva recibida. El pago será contra entrega en efectivo."
        : `Pago procesado con ${method === "paypal" ? "PayPal" : "Paguelo Fácil"}.`,
  });
}

export async function POST() {
  return NextResponse.json(
    { error: "Esta ruta fue reemplazada por el checkout seguro." },
    { status: 410 },
  );
}

async function requireAdmin() {
  const user = await getChatGPTUser();
  if (!user || !isAdminEmail(user.email)) return null;
  return user;
}
export async function GET(request: Request) {
  if (!(await requireAdmin()))
    return NextResponse.json(
      { error: "Acceso de administrador requerido." },
      { status: 403 },
    );
  const db = await ensureDatabase();
  const reference = new URL(request.url).searchParams.get("reference");
  if (reference) {
    const [order, history] = await Promise.all([
      db
        .prepare("SELECT * FROM bookings WHERE reference=?")
        .bind(reference)
        .first(),
      db
        .prepare(
          "SELECT * FROM booking_status_history WHERE booking_reference=? ORDER BY id DESC",
        )
        .bind(reference)
        .all(),
    ]);
    return NextResponse.json({ order, history: history.results });
  }
  const result = await db
    .prepare("SELECT * FROM bookings ORDER BY id DESC LIMIT 300")
    .all();
  return NextResponse.json(result.results);
}
export async function PATCH(request: Request) {
  const body = (await request.json()) as Record<string, unknown>;
  const current = await getChatGPTUser();
  if (!current)
    return NextResponse.json({ error: "Inicia sesión." }, { status: 401 });
  const db = await ensureDatabase();
  if (body.action === "request_cancel") {
    const ref = String(body.reference ?? "");
    const existing = await db
      .prepare("SELECT * FROM bookings WHERE reference=? AND user_id=?")
      .bind(ref, current.userId)
      .first<BookingRow>();
    if (!existing)
      return NextResponse.json(
        { error: "Pedido no encontrado." },
        { status: 404 },
      );
    const today = new Date().toISOString().slice(0, 10);
    const diff = Math.round(
      (new Date(`${existing.tour_date}T12:00:00`).getTime() -
        new Date(`${today}T12:00:00`).getTime()) /
        86400000,
    );
    if (diff <= 1)
      return NextResponse.json(
        {
          error:
            "No puedes solicitar la cancelación el mismo día del tour ni el día anterior.",
        },
        { status: 400 },
      );
    const reason =
      String(body.reason ?? "")
        .trim()
        .slice(0, 500) || "Solicitud del cliente";
    const now = new Date().toISOString();
    await db
      .prepare(
        `UPDATE bookings SET status='cancellation_requested',updated_at=? WHERE reference=? AND status IN ('pending','confirmed')`,
      )
      .bind(now, ref)
      .run();
    await db
      .prepare(
        `INSERT INTO booking_status_history (booking_reference,status,note,changed_by,created_at) VALUES (?,'cancellation_requested',?,?,?)`,
      )
      .bind(ref, reason, current.email, now)
      .run();
    const order = await db
      .prepare("SELECT * FROM bookings WHERE reference=?")
      .bind(ref)
      .first<BookingRow>();
    if (order) {
      await notifyBookingStatus(db, order);
      await syncBookingToNotion(order);
    }
    return NextResponse.json({ ok: true });
  }
  if (!isAdminEmail(current.email))
    return NextResponse.json(
      { error: "Acceso de administrador requerido." },
      { status: 403 },
    );
  if (body.action === "mark_seen") {
    await db
      .prepare("UPDATE bookings SET seen=1 WHERE reference=?")
      .bind(String(body.reference ?? ""))
      .run();
    return NextResponse.json({ ok: true });
  }
  const status = String(body.status ?? "");
  if (!allowedStatuses.includes(status))
    return NextResponse.json({ error: "Estado inválido." }, { status: 400 });
  const reference = String(body.reference ?? "");
  const previous = await db
    .prepare("SELECT * FROM bookings WHERE reference=?")
    .bind(reference)
    .first<BookingRow>();
  if (!previous)
    return NextResponse.json(
      { error: "Pedido no encontrado." },
      { status: 404 },
    );
  const now = new Date().toISOString();
  const customerName = String(
    body.customerName ?? previous.customer_name,
  ).trim();
  const email = String(body.email ?? previous.email)
    .trim()
    .toLowerCase();
  const phone = String(body.phone ?? previous.phone).trim();
  const tourDate = String(body.tourDate ?? previous.tour_date);
  const quantity = Math.max(1, Number(body.quantity ?? previous.quantity));
  const total = Math.max(0, Number(body.total ?? previous.total));
  const adminNotes = String(
    body.adminNotes ?? previous.admin_notes ?? "",
  ).slice(0, 2000);
  await db
    .prepare(
      "UPDATE bookings SET customer_name=?,email=?,phone=?,tour_date=?,quantity=?,total=?,status=?,admin_notes=?,updated_at=? WHERE reference=?",
    )
    .bind(
      customerName,
      email,
      phone,
      tourDate,
      quantity,
      total,
      status,
      adminNotes,
      now,
      reference,
    )
    .run();
  if (status !== previous.status || String(body.statusNote ?? "").trim())
    await db
      .prepare(
        "INSERT INTO booking_status_history (booking_reference,status,note,changed_by,created_at) VALUES (?,?,?,?,?)",
      )
      .bind(
        reference,
        status,
        String(body.statusNote ?? "Actualización administrativa").slice(0, 500),
        current.email,
        now,
      )
      .run();
  const order = await db
    .prepare("SELECT * FROM bookings WHERE reference=?")
    .bind(reference)
    .first<BookingRow>();
  if (order) {
    if (status !== previous.status) await notifyBookingStatus(db, order);
    const pageId = await syncBookingToNotion(order);
    if (pageId && !order.notion_page_id)
      await db
        .prepare("UPDATE bookings SET notion_page_id=? WHERE reference=?")
        .bind(pageId, order.reference)
        .run();
  }
  return NextResponse.json({ ok: true, order });
}
export async function DELETE(request: Request) {
  if (!(await requireAdmin()))
    return NextResponse.json(
      { error: "Acceso de administrador requerido." },
      { status: 403 },
    );
  const body = (await request.json()) as Record<string, unknown>;
  const reference = String(body.reference ?? "").trim();
  if (!reference)
    return NextResponse.json(
      { error: "Referencia inválida." },
      { status: 400 },
    );
  const db = await ensureDatabase();
  const existing = await db
    .prepare("SELECT * FROM bookings WHERE reference=?")
    .bind(reference)
    .first<BookingRow>();
  if (!existing)
    return NextResponse.json(
      { error: "Pedido no encontrado." },
      { status: 404 },
    );
  await db
    .prepare("DELETE FROM booking_status_history WHERE booking_reference=?")
    .bind(reference)
    .run();
  await db
    .prepare("DELETE FROM bookings WHERE reference=?")
    .bind(reference)
    .run();
  return NextResponse.json({ ok: true });
}
