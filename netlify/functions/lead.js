export async function handler(event) {
  // CORS (на всякий случай)
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders, body: "ok" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: corsHeaders, body: "Method Not Allowed" };
  }

  try {
    const data = JSON.parse(event.body || "{}");

    console.log("LEAD RECEIVED:", data);
    console.log("LEAD RAW BODY LENGTH:", (event.body || "").length);

    // Сообщение в WhatsApp
    const msg =
`🔔 New Lead (Lucky Handyman)

Name: ${data.name || "-"}
Phone: ${data.phone || "-"}
City: ${data.city || "-"}
Details: ${data.details || "-"}
Source: ${data.source || "-"}
Page: ${data.page || "-"}
Time: ${data.ts || "-"}`;

    const token = process.env.WHATSAPP_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_ID;
    const to = process.env.WHATSAPP_TO;

    if (!token || !phoneId || !to) {
      console.log("WHATSAPP ENV MISSING:", {
        hasToken: !!token,
        hasPhoneId: !!phoneId,
        hasTo: !!to
      });
      // лид приняли, но WhatsApp не настроен
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ ok: true, whatsapp: "skipped_env_missing" })
      };
    }

    const r = await fetch(`https://graph.facebook.com/v22.0/${phoneId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: msg }
      })
    });

    const resultText = await r.text();
    console.log("WHATSAPP STATUS:", r.status);
    console.log("WHATSAPP BODY:", resultText);

    if (!r.ok) {
      // лид приняли, но WA не отправился — чтобы форма не падала
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ ok: true, whatsapp: "failed", status: r.status })
      };
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ ok: true, whatsapp: "sent" })
    };

  } catch (err) {
    console.error("LEAD ERROR:", err);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ ok: false, error: "server_error" })
    };
  }
}
