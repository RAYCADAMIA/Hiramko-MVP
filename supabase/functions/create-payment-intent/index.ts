import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { rentalId, amount, itemTitle } = await req.json();

        // 1. Get Secret Key from Env
        const secretKey = Deno.env.get('PAYMONGO_SECRET_KEY');
        if (!secretKey) {
            throw new Error('PAYMONGO_SECRET_KEY is not set');
        }

        // 2. Encode Key for Basic Auth
        const authHeader = `Basic ${btoa(secretKey + ':')}`;

        // 3. Create Checkout Session
        const response = await fetch('https://api.paymongo.com/v1/checkout_sessions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader,
            },
            body: JSON.stringify({
                data: {
                    attributes: {
                        line_items: [
                            {
                                currency: 'PHP',
                                amount: amount * 100, // PayMongo uses centavos
                                description: `Rental: ${itemTitle} (ID: ${rentalId})`,
                                name: itemTitle,
                                quantity: 1,
                            },
                        ],
                        payment_method_types: ['card', 'gcash', 'paymaya', 'grab_pay'],
                        success_url: `http://localhost:5173/#/dashboard?payment_success=true&rentalId=${rentalId}`, // Update for prod
                        cancel_url: `http://localhost:5173/#/item/${rentalId.split('_')[0]}?payment_cancel=true`, // Simplified fallback
                        description: `HiramKo Rental for ${itemTitle}`,
                    },
                },
            }),
        });

        const data = await response.json();

        if (data.errors) {
            console.error('PayMongo Error:', data.errors);
            throw new Error(data.errors[0].detail || 'Payment creation failed');
        }

        const checkoutUrl = data.data.attributes.checkout_url;

        return new Response(JSON.stringify({ checkoutUrl }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
});
