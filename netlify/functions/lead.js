// netlify/functions/lead.js

exports.handler = async (event) => {
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  // CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  // allow only POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ ok: false, error: "Method Not Allowed" }),
    };
  }

  try {
    const raw = event.body || "";
    const data = raw ? JSON.parse(raw) : {};

    // ✅ ЛОГИ (это главное сейчас)
    console.log("LEAD RECEIVED:", {
      name: data?.name,
      phone: data?.phone,
      city: data?.city,
      source: data?.source,
      page: data?.page,
      ts: data?.ts,
    });
    console.log("LEAD RAW BODY LENGTH:", raw.length);

    // TODO: позже тут будет отправка в ERPNext

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ok: true }),
    };
  } catch (e) {
    console.error("LEAD ERROR:", e);
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ ok: false, error: "Bad JSON" }),
    };
  }
};
