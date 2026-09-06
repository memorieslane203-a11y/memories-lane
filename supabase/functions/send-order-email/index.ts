import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")
const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") || "memories.lane.203@gmail.com"

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" } })
  }
  try {
    const { order } = await req.json()
    if (!order) throw new Error("Missing order")
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not set")

    const itemsText = (order.items || []).map((i: any) => `${i.name} ×${i.qty} — ₹${Math.round(i.price * 83.5 * i.qty)}`).join("\n")
    const c = order.customer || {}
    const html = `
      <div style="font-family:system-ui,sans-serif;max-width:600px;margin:auto;border:1px solid #eee;border-radius:12px;padding:24px">
        <h1 style="color:#4a1a2e">🎀 New Order — Memories Lane</h1>
        <p><b>Order ID:</b> ${order.id || "—"}<br/><b>Date:</b> ${new Date(order.created_at || Date.now()).toLocaleString()}<br/><b>Status:</b> ${order.status || "confirmed"}</p>
        <div style="background:#fdf2f8;padding:12px;border-radius:8px;margin:12px 0">
          <b>Customer:</b> ${c.firstName || ""} ${c.lastName || ""}<br/>
          Email: ${order.email || c.email || "-"}<br/>
          Phone: ${c.phone || "-"}<br/>
          Address: ${c.address || ""}, ${c.city || ""} ${c.state || ""} ${c.zip || ""}, ${c.country || ""}
        </div>
        <div style="background:#fffafb;padding:12px;border-radius:8px;border:1px solid #eee">
          <b>Items:</b><br/><pre style="white-space:pre-wrap;font-family:monospace">${itemsText}</pre>
          <p><b>Total:</b> ₹${order.totals?.total ? Math.round(order.totals.total * 83.5) : "-"} ${order.totals?.paymentMethod ? `· ${order.totals.paymentMethod.toUpperCase()}` : ""}</p>
          ${order.gift_note ? `<p><b>Gift note:</b> “${order.gift_note}”</p>` : ""}
          ${order.delivery_date ? `<p><b>Delivery:</b> ${order.delivery_date}</p>` : ""}
        </div>
        <p style="color:#888;font-size:12px;margin-top:16px">View all orders in Supabase → Table Editor → orders or at /admin</p>
      </div>
    `

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Memories Lane <orders@resend.dev>",
        to: [ADMIN_EMAIL],
        subject: `New Order ${order.id ? order.id.slice(0,8).toUpperCase() : ""} — ${c.firstName || order.email} — ₹${order.totals?.total ? Math.round(order.totals.total * 83.5) : ""}`,
        html,
      }),
    })
    if (!res.ok) {
      const txt = await res.text()
      throw new Error(`Resend failed: ${txt}`)
    }
    return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } })
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } })
  }
})
