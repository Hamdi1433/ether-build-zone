
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
)

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const payload = await req.json()
    console.log("Webhook reçu de Brevo:", JSON.stringify(payload, null, 2))

    // Traiter les différents types d'événements Brevo
    const eventType = payload.event
    const email = payload.email
    const messageId = payload["message-id"]
    const campaignId = payload.tags?.[0] // On utilise le premier tag comme campaign_id

    console.log(`Événement: ${eventType}, Email: ${email}, Message ID: ${messageId}`)

    switch (eventType) {
      case "delivered":
        await handleEmailDelivered(payload)
        break
      case "opened":
        await handleEmailOpened(payload)
        break
      case "click":
        await handleEmailClicked(payload)
        break
      case "bounced":
      case "hard_bounced":
      case "soft_bounced":
        await handleEmailBounced(payload)
        break
      case "unsubscribed":
        await handleEmailUnsubscribed(payload)
        break
      default:
        console.log(`Événement non traité: ${eventType}`)
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    })
  } catch (error) {
    console.error("Erreur webhook Brevo:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    })
  }
})

async function handleEmailDelivered(payload: any) {
  const { error } = await supabase.from("interactions").insert({
    contact_id: await getContactIdByEmail(payload.email),
    type: "envoi",
    canal: "email",
    sujet: payload.subject || "Email envoyé",
    message: `Email délivré avec succès`,
    statut: "success",
    created_at: new Date(payload.ts * 1000).toISOString()
  })

  if (error) console.error("Erreur insertion delivered:", error)
}

async function handleEmailOpened(payload: any) {
  const { error } = await supabase.from("interactions").insert({
    contact_id: await getContactIdByEmail(payload.email),
    type: "ouverture",
    canal: "email",
    sujet: payload.subject || "Email ouvert",
    message: `Email ouvert`,
    statut: "success",
    created_at: new Date(payload.ts * 1000).toISOString()
  })

  if (error) console.error("Erreur insertion opened:", error)
}

async function handleEmailClicked(payload: any) {
  const { error } = await supabase.from("interactions").insert({
    contact_id: await getContactIdByEmail(payload.email),
    type: "clic",
    canal: "email",
    sujet: payload.subject || "Lien cliqué",
    message: `Lien cliqué: ${payload.link}`,
    statut: "success",
    created_at: new Date(payload.ts * 1000).toISOString()
  })

  if (error) console.error("Erreur insertion clicked:", error)
}

async function handleEmailBounced(payload: any) {
  const { error } = await supabase.from("interactions").insert({
    contact_id: await getContactIdByEmail(payload.email),
    type: "bounce",
    canal: "email",
    sujet: payload.subject || "Email bounce",
    message: `Email bounce: ${payload.reason}`,
    statut: "error",
    created_at: new Date(payload.ts * 1000).toISOString()
  })

  if (error) console.error("Erreur insertion bounced:", error)
}

async function handleEmailUnsubscribed(payload: any) {
  const { error } = await supabase.from("interactions").insert({
    contact_id: await getContactIdByEmail(payload.email),
    type: "desabonnement",
    canal: "email",
    sujet: "Désabonnement",
    message: `Contact désabonné`,
    statut: "info",
    created_at: new Date(payload.ts * 1000).toISOString()
  })

  if (error) console.error("Erreur insertion unsubscribed:", error)
}

async function getContactIdByEmail(email: string): Promise<number | null> {
  const { data, error } = await supabase
    .from("contact")
    .select("identifiant")
    .eq("email", email)
    .single()

  if (error || !data) {
    console.log(`Contact non trouvé pour l'email: ${email}`)
    return null
  }

  return data.identifiant
}
