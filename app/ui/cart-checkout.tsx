"use client";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { CART_KEY, type CartItem } from "./booking-widget";
import { SiteLink as Link } from "./site-link";
import { TurnstileWidget } from "./turnstile-widget";
type Method = "cash" | "paguelo" | "paypal";
type AppliedCoupon = {
  code: string;
  discount: number;
  subtotal: number;
  total: number;
};
export function CartCheckout({
  isLoggedIn = false,
  customer,
  turnstileSiteKey,
  paymentMethods = { cash: true, paguelo: true, paypal: true },
  liabilityWaiver = "",
}: {
  isLoggedIn?: boolean;
  customer?: { fullName?: string; email?: string; phone?: string };
  turnstileSiteKey: string;
  paymentMethods?: { cash: boolean; paguelo: boolean; paypal: boolean };
  liabilityWaiver?: string;
}) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState("");
  const [payMethod, setPayMethod] = useState<Method>("cash");
  const [hasPending, setHasPending] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);
  const [couponStatus, setCouponStatus] = useState("");
  const [checkoutEmail, setCheckoutEmail] = useState(customer?.email || "");
  const [challengeKey, setChallengeKey] = useState(0);
  const [acceptedLiability, setAcceptedLiability] = useState(false);
  const [waiverOpen, setWaiverOpen] = useState(false);
  useEffect(() => {
    try {
      setItems(
        JSON.parse(localStorage.getItem(CART_KEY) || "[]") as CartItem[],
      );
    } catch {
      setItems([]);
    }
    setHasPending(
      Boolean(
        sessionStorage.getItem("bongo-pending-payment") ||
        sessionStorage.getItem("bongo-pending-paypal"),
      ),
    );
    setReady(true);
  }, []);
  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.total, 0),
    [items],
  );
  const finalTotal = coupon?.total ?? subtotal;
  const compactItems = items.map((item) => ({
    tourSlug: item.tourSlug,
    tourDate: item.tourDate,
    quantity: item.quantity,
    priceMode: item.priceMode,
  }));
  function remove(index: number) {
    const next = items.filter((_, i) => i !== index);
    setItems(next);
    setCoupon(null);
    setCouponStatus("");
    localStorage.setItem(CART_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("bongo-cart-updated"));
  }
  async function applyCoupon() {
    if (!couponCode.trim()) {
      setCouponStatus("Escribe un código.");
      return;
    }
    setCouponStatus("Validando…");
    const response = await fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        code: couponCode,
        items: compactItems,
        email: checkoutEmail,
      }),
    });
    const data = (await response.json()) as AppliedCoupon & {
      valid?: boolean;
      error?: string;
    };
    if (!response.ok || !data.valid) {
      setCoupon(null);
      setCouponStatus(data.error || "Cupón no válido.");
      return;
    }
    setCoupon({
      code: data.code,
      discount: data.discount,
      subtotal: data.subtotal,
      total: data.total,
    });
    setCouponCode(data.code);
    setCouponStatus(`Cupón aplicado: ahorras $${data.discount.toFixed(2)}.`);
  }
  async function confirm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!items.length) return;
    if (!acceptedLiability) {
      setStatus("Debes aceptar la Liberación de Responsabilidad para continuar.");
      return;
    }
    const raw = Object.fromEntries(
      new FormData(event.currentTarget).entries(),
    ) as Record<string, unknown>;
    const contact = {
      customerName: raw.customerName,
      email: raw.email,
      phone: raw.phone,
    };
    const turnstileToken = String(raw.turnstileToken ?? "");
    let verified = coupon;
    if (coupon) {
      const check = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          code: coupon.code,
          items: compactItems,
          email: contact.email,
        }),
      });
      const data = (await check.json()) as AppliedCoupon & {
        valid?: boolean;
        error?: string;
      };
      if (!check.ok || !data.valid) {
        setCoupon(null);
        setCouponStatus(data.error || "El cupón dejó de ser válido.");
        setStatus("Revisa el cupón antes de continuar.");
        setChallengeKey((key) => key + 1);
        return;
      }
      verified = {
        code: data.code,
        discount: data.discount,
        subtotal: data.subtotal,
        total: data.total,
      };
      setCoupon(verified);
    }
    const payable = verified?.total ?? subtotal;
    const checkoutKey = crypto.randomUUID();
    const pending = {
      contact,
      items,
      subtotal: Number(subtotal.toFixed(2)),
      discount: verified?.discount ?? 0,
      total: Number(payable.toFixed(2)),
      couponCode: verified?.code,
      checkoutKey,
    };
    setStatus(
      payMethod === "cash"
        ? "Confirmando tu pedido…"
        : "Conectando con la plataforma de pago…",
    );
    try {
      if (payMethod === "paguelo") {
        sessionStorage.setItem("bongo-pending-payment", JSON.stringify(pending));
        const controller = new AbortController();
        const timeout = window.setTimeout(() => controller.abort(), 35000);
        try {
        const response = await fetch("/api/payments/paguelo", {
          method: "POST",
          signal: controller.signal,
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            contact: pending.contact,
            items: compactItems,
            couponCode: pending.couponCode,
            checkoutKey: pending.checkoutKey,
            turnstileToken,
            liabilityAccepted: true,
          }),
        });
        const data = (await response.json()) as {
          success?: boolean;
          url?: string;
          message?: string;
        };
        if (!response.ok || !data.success || !data.url) {
          sessionStorage.removeItem("bongo-pending-payment");
          setStatus(data.message || "No se pudo iniciar el pago.");
          setChallengeKey((key) => key + 1);
          return;
        }
        window.location.assign(data.url);
        return;
        } catch (error) {
          if (controller.signal.aborted) {
            setStatus("La conexión con Paguelo Fácil tardó demasiado. Tu carrito se conserva. Verifica tu conexión y vuelve a pulsar el botón de pago.");
            setChallengeKey((key) => key + 1);
            return;
          }
          throw error;
        } finally {
          window.clearTimeout(timeout);
        }
      }
      if (payMethod === "paypal") {
        sessionStorage.setItem("bongo-pending-paypal", JSON.stringify(pending));
        const response = await fetch("/api/payments/paypal", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            contact: pending.contact,
            items: compactItems,
            couponCode: pending.couponCode,
            checkoutKey: pending.checkoutKey,
            turnstileToken,
            liabilityAccepted: true,
          }),
        });
        const data = (await response.json()) as {
          success?: boolean;
          url?: string;
          message?: string;
        };
        if (!data.success || !data.url) {
          sessionStorage.removeItem("bongo-pending-paypal");
          setStatus(data.message || "No se pudo iniciar PayPal.");
          setChallengeKey((key) => key + 1);
          return;
        }
        window.location.assign(data.url);
        return;
      }
      const response = await fetch("/api/bookings/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...contact,
          items: compactItems,
          couponCode: verified?.code,
          checkoutKey,
          turnstileToken,
          liabilityAccepted: true,
        }),
      });
      const data = (await response.json()) as {
        orders?: Record<string, unknown>[];
        items?: CartItem[];
        total?: number;
        subtotal?: number;
        discount?: number;
        couponCode?: string;
        error?: string;
      };
      if (!response.ok || !data.orders?.length) {
        setStatus(data.error || "No pudimos confirmar el pedido.");
        setChallengeKey((key) => key + 1);
        return;
      }
      sessionStorage.setItem(
        "bongo-last-order",
        JSON.stringify({
          orders: data.orders,
          items: data.items ?? items,
          contact,
          total: data.total ?? payable,
          subtotal: data.subtotal ?? subtotal,
          discount: data.discount ?? 0,
          couponCode: data.couponCode,
          createdAt: new Date().toISOString(),
        }),
      );
      localStorage.removeItem(CART_KEY);
      setItems([]);
      window.location.assign("/orden/confirmada");
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "No pudimos confirmar el pedido.",
      );
      setChallengeKey((key) => key + 1);
    }
  }
  if (!ready) return <div className="cart-empty">Cargando carrito…</div>;
  if (!items.length)
    return (
      <div className="cart-empty">
        <span>✓</span>
        <h2>{status ? "Pedido enviado" : "Tu carrito está vacío"}</h2>
        <p>
          {status ||
            "Selecciona una fecha desde la página de un tour para comenzar."}
        </p>
        <Link className="button button--primary" href="/tours">
          Explorar tours
        </Link>
      </div>
    );
  return (
    <div className="cart-layout">
      <section className="cart-items">
        <h2>Tu selección</h2>
        {items.map((item, index) => (
          <article key={`${item.tourSlug}-${item.tourDate}`}>
            <img src={item.image || "/images/bongo-hero.png"} alt="" />
            <div>
              <h3>{item.tourName}</h3>
              <p>
                ▣ {item.tourDate} · ♙ {item.quantity}{" "}
                {item.quantity === 1 ? "persona" : "personas"}
              </p>
              <small>
                {item.priceMode === "group" ? "Tarifa por grupo" : "Tarifa por persona"}
              </small>
            </div>
            <strong>${item.total.toFixed(2)}</strong>
            <button
              type="button"
              onClick={() => remove(index)}
              aria-label={`Quitar ${item.tourName}`}
            >
              ×
            </button>
          </article>
        ))}
      </section>
      <aside className="cart-summary">
        <h2>Confirmar pedido</h2>
        <div className="coupon-box">
          <label>Cupón de descuento</label>
          <div>
            <input
              value={couponCode}
              onChange={(event) => {
                setCouponCode(event.target.value.toUpperCase());
                if (coupon) setCoupon(null);
              }}
              placeholder="Código"
            />
            <button type="button" onClick={() => void applyCoupon()}>
              Aplicar
            </button>
          </div>
          {couponStatus && (
            <p className={coupon ? "coupon-success" : "coupon-error"}>
              {couponStatus}
            </p>
          )}
        </div>
        <div className="cart-totals">
          <p>
            <span>Subtotal</span>
            <b>${subtotal.toFixed(2)}</b>
          </p>
          {coupon && (
            <p className="discount">
              <span>Descuento ({coupon.code})</span>
              <b>−${coupon.discount.toFixed(2)}</b>
            </p>
          )}
          <p className="grand-total">
            <span>Total</span>
            <strong>${finalTotal.toFixed(2)}</strong>
          </p>
        </div>
        {hasPending && (
          <div className="pending-banner">
            <span>⚠️</span>
            <div>
              <b>Tienes un pago en proceso</b>
              <p>
                Si ya completaste el pago, vuelve a la ventana de la plataforma
                para finalizar.
              </p>
            </div>
          </div>
        )}
        {!isLoggedIn && (
          <div className="cart-account-note">
            <span>¿Tienes cuenta?</span>
            <div>
              <Link href="/acceso?return_to=/carrito">Inicia sesión</Link>
              <span>·</span>
              <Link href="/acceso?return_to=/carrito">Regístrate</Link>
            </div>
          </div>
        )}
        <form onSubmit={confirm}>
          <label>
            Nombre completo
            <input
              name="customerName"
              required
              maxLength={120}
              defaultValue={customer?.fullName || ""}
            />
          </label>
          <label>
            Correo electrónico
            <input
              name="email"
              type="email"
              required
              maxLength={254}
              value={checkoutEmail}
              onChange={(event) => {
                setCheckoutEmail(event.target.value);
                if (coupon) setCoupon(null);
              }}
            />
          </label>
          <label>
            WhatsApp o teléfono
            <input
              name="phone"
              required
              maxLength={40}
              placeholder="+507 ..."
              defaultValue={customer?.phone || ""}
            />
          </label>
          <div className="pay-methods">
            {paymentMethods.cash && (
              <label
                className={`pay-method${payMethod === "cash" ? " is-active" : ""}`}
              >
                <input
                  type="radio"
                  name="payMethod"
                  checked={payMethod === "cash"}
                  onChange={() => setPayMethod("cash")}
                />
                <span>Efectivo contra entrega</span>
              </label>
            )}
            {paymentMethods.paguelo && (
              <label
                className={`pay-method${payMethod === "paguelo" ? " is-active" : ""}`}
              >
                <input
                  type="radio"
                  name="payMethod"
                  checked={payMethod === "paguelo"}
                  onChange={() => setPayMethod("paguelo")}
                />
                <span>
                  Tarjeta <small>(Paguelo Fácil)</small>
                </span>
              </label>
            )}
            {paymentMethods.paypal && (
              <label
                className={`pay-method paypal${payMethod === "paypal" ? " is-active" : ""}`}
              >
                <input
                  type="radio"
                  name="payMethod"
                  checked={payMethod === "paypal"}
                  onChange={() => setPayMethod("paypal")}
                />
                <span>
                  PayPal o tarjeta <small>Pago seguro</small>
                </span>
              </label>
            )}
          </div>
          <label className="check-row liability-check">
            <input
              type="checkbox"
              checked={acceptedLiability}
              onChange={(e) => setAcceptedLiability(e.target.checked)}
            />
            <span>
              Acepto{" "}
              <button
                type="button"
                className="liability-link"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setWaiverOpen(true);
                }}
              >
                Liberación de Responsabilidad
              </button>{" "}
              <small>Requerida para proceder con el pago</small>
            </span>
          </label>
          {waiverOpen && (
            <div className="waiver-modal" onClick={() => setWaiverOpen(false)}>
              <div
                className="waiver-modal__panel"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="waiver-modal__head">
                  <b>Liberación de Responsabilidad</b>
                  <button
                    type="button"
                    onClick={() => setWaiverOpen(false)}
                    aria-label="Cerrar"
                  >
                    ×
                  </button>
                </div>
                <div
                  className="waiver-modal__body rich-content"
                  dangerouslySetInnerHTML={{ __html: liabilityWaiver }}
                />
                <div className="waiver-modal__actions">
                  <button
                    type="button"
                    className="button button--primary"
                    onClick={() => {
                      setWaiverOpen(false);
                      setAcceptedLiability(true);
                    }}
                  >
                    Aceptar y continuar
                  </button>
                </div>
              </div>
            </div>
          )}
          {turnstileSiteKey && (
            <TurnstileWidget
              key={challengeKey}
              siteKey={turnstileSiteKey}
              action="checkout"
            />
          )}
          <button className="button button--primary full" type="submit">
            {payMethod === "cash"
              ? "Confirmar pedido"
              : "Continuar con PayPal o tarjeta"}{" "}
            <b>→</b>
          </button>
          <a
            className="button button--whatsapp full"
            target="_blank"
            rel="noreferrer"
            href={`https://wa.me/50760909741?text=${encodeURIComponent("Hola Bongo Outdoors, necesito ayuda con mi carrito de reserva.")}`}
          >
            Ayuda por WhatsApp
          </a>
          {status && (
            <p className="form-status" role="status">
              {status}
            </p>
          )}
        </form>
      </aside>
    </div>
  );
}
