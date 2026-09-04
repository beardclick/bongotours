import { NextResponse } from "next/server";
import { env } from "cloudflare:workers";
import { createPayPalOrder } from "../../../lib/paypal";
import { ensureDatabase } from "../../../../db/runtime";
import { getChatGPTUser } from "../../../chatgpt-auth";
import { validateCoupon, type CouponItem } from "../../../lib/coupons";
import {
  priceCheckoutItems,
  type CheckoutItemInput,
} from "../../../lib/checkout-pricing";
import { verifyTurnstile } from "../../../lib/turnstile";
import { getPaymentMethods } from "../../../lib/settings";
export async function POST(request: Request) {
  try {
    if (!(await getPaymentMethods()).paypal)
      return NextResponse.json(
        { success: false, message: "El pago con PayPal está deshabilitado temporalmente." },
        { status: 400 },
      );
    const body = (await request.json()) as Record<string, unknown>;
    if (!(await verifyTurnstile(request, body.turnstileToken, "checkout")))
      return NextResponse.json(
        { success: false, message: "Completa la verificación de seguridad." },
        { status: 400 },
      );
    const contact =
      body.contact && typeof body.contact === "object"
        ? (body.contact as Record<string, unknown>)
        : {};
    const customerName = String(contact.customerName ?? "")
      .trim()
      .slice(0, 120);
    const email = String(contact.email ?? "")
      .trim()
      .toLowerCase()
      .slice(0, 254);
    const phone = String(contact.phone ?? "")
      .trim()
      .slice(0, 40);
    if (
      customerName.length < 2 ||
      !/^\S+@\S+\.\S+$/.test(email) ||
      phone.length < 7
    )
      return NextResponse.json(
        { success: false, message: "Revisa tu nombre, correo y teléfono." },
        { status: 400 },
      );
    const [{ items, subtotal }, db, user] = await Promise.all([
      priceCheckoutItems(
        Array.isArray(body.items) ? (body.items as CheckoutItemInput[]) : [],
      ),
      ensureDatabase(),
      getChatGPTUser(),
    ]);
    const couponCode = String(body.couponCode ?? "").trim();
    const checkoutKey = String(body.checkoutKey ?? crypto.randomUUID())
      .trim()
      .slice(0, 80);
    const couponResult = couponCode
      ? await validateCoupon(db, {
          code: couponCode,
          items: items as CouponItem[],
          email,
          userId: user?.userId,
          checkoutKey,
        })
      : null;
    if (couponResult && !couponResult.valid)
      return NextResponse.json(
        { success: false, message: couponResult.error },
        { status: 400 },
      );
    const coupon = couponResult?.valid ? couponResult : null;
    const amount = coupon?.total ?? subtotal;
    const site = String(
      (env as unknown as Record<string, unknown>).SITE_URL ||
        new URL(request.url).origin,
    ).replace(/\/$/, "");
    const result = await createPayPalOrder(
      amount,
      `${site}/orden/pago-paypal`,
      `${site}/carrito?paypal=cancelled`,
    );
    const payload = JSON.stringify({
      contact: { customerName, email, phone },
      items,
      subtotal,
      discount: coupon?.discount ?? 0,
      total: amount,
      couponCode: coupon?.code ?? "",
      checkoutKey,
    });
    await db
      .prepare(
        `INSERT INTO pending_payments (provider,reference,payload,status,created_at) VALUES (?,?,?,'pending',?)`,
      )
      .bind("paypal", result.orderId, payload, new Date().toISOString())
      .run();
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "No se pudo iniciar PayPal.",
      },
      { status: 400 },
    );
  }
}
