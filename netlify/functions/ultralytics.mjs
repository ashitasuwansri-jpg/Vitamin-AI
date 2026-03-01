// Netlify Function v2 — Proxy Ultralytics Hub Predict API
// รับ request จาก frontend แล้ว forward ไปยัง Ultralytics Hub API
// รองรับทุกโมเดล (Pill, X-ray) โดยใช้ API key ระบุโมเดล

export const config = {
    path: "/api/ultralytics",
};

export default async (req) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response(null, {
            status: 204,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
        });
    }

    try {
        // ดึง API key จาก Authorization header (Bearer ul_xxx)
        const authHeader = req.headers.get("authorization") || "";
        const apiKey = authHeader.replace(/^Bearer\s+/i, "").trim();

        if (!apiKey) {
            return new Response(
                JSON.stringify({ error: "Missing API key in Authorization header" }),
                {
                    status: 400,
                    headers: {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*",
                    },
                }
            );
        }

        // อ่าน body ดิบทั้งหมด (multipart/form-data + ไฟล์ไบนารี)
        const body = await req.arrayBuffer();

        // Forward ไปยัง Ultralytics Hub Predict API
        // API key ใน URL path ระบุว่าจะใช้โมเดลไหน
        const upstreamUrl = `https://api.ultralytics.com/v1/predict/${apiKey}`;

        const response = await fetch(upstreamUrl, {
            method: "POST",
            headers: {
                "Content-Type": req.headers.get("content-type") || "",
            },
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
