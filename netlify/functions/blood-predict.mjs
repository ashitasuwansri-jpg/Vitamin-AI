// Netlify Function v2 — Proxy Blood Cell Prediction API

const UPSTREAM_URL = "https://predict-699a748c98b9c326aa85-dproatj77a-as.a.run.app/predict";

export const config = {
    path: "/api/blood-predict",
};

export default async (req) => {
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
        const body = await req.arrayBuffer();

        const response = await fetch(UPSTREAM_URL, {
            method: "POST",
            headers: {
                "Authorization": req.headers.get("authorization") || "",
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
                headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
            }
        );
    }
};
