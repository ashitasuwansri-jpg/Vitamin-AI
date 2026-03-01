// Netlify Function v2 — Proxy Google Gemini Chat API
// ใช้ Serverless Function เป็นตัวกลาง เพื่อหลีกเลี่ยง CORS
// API key ฝังอยู่ฝั่ง server เพื่อความปลอดภัย

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
const GEMINI_API_KEY = "AIzaSyAU8CDdWfMRQydtjr-3cigU-dcl_3OK7xk";

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

        // Forward ไปยัง Gemini API (ใช้ key ที่ฝังอยู่ฝั่ง server)
        const response = await fetch(`${GEMINI_BASE}?key=${GEMINI_API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: body,
        });

        const data = await response.text();

        return new Response(data, {
            status: response.status,
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
