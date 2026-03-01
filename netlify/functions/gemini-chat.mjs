// Netlify Function v2 — Proxy Google Gemini Chat API
// ใช้ Serverless Function เป็นตัวกลาง เพื่อหลีกเลี่ยง CORS
// API key ฝังอยู่ฝั่ง server เพื่อความปลอดภัย

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
const GEMINI_API_KEY = "AIzaSyDno0MelTGQEI_nn3FhoG6adHMJsKBm7Pw";

export const config = {
    path: "/api/gemini",
};

export default async (req) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response(null, {
            status: 204,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            },
        });
    }

    try {
        // อ่าน JSON body จาก frontend
        const body = await req.text();

        // ลองเรียก Gemini API — ถ้า model แรก 403 ให้ fallback
        const models = [
            "gemini-2.5-flash",
            "gemini-2.0-flash-lite",
            "gemini-2.5-pro"
        ];

        let lastResponse = null;
        for (const model of models) {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
            lastResponse = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: body,
            });

            // ถ้าสำเร็จหรือไม่ใช่ 403/404 ก็ใช้เลย
            if (lastResponse.ok || (lastResponse.status !== 403 && lastResponse.status !== 404)) {
                break;
            }
        }

        const data = await lastResponse.text();

        return new Response(data, {
            status: lastResponse.status,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
        });
    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                status: 502,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
            }
        );
    }
};
