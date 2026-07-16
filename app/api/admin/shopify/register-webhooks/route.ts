import { NextResponse } from "next/server";
import { requireApiRole } from "@/lib/api-auth";
import { shopifyAdmin } from "@/lib/shopify-admin";

const MUTATION = `#graphql
  mutation CreateWebhook($topic: WebhookSubscriptionTopic!, $callbackUrl: URL!) {
    webhookSubscriptionCreate(topic: $topic, webhookSubscription: { callbackUrl: $callbackUrl, format: JSON }) {
      webhookSubscription { id topic uri }
      userErrors { field message }
    }
  }
`;

type Result = { webhookSubscriptionCreate: { webhookSubscription: { id: string; topic: string; uri: string } | null; userErrors: Array<{ message: string }> } };

export async function POST() {
  const auth = await requireApiRole("admin");
  if (auth.response) return auth.response;
  const appUrl = process.env.APP_URL;
  if (!appUrl) return NextResponse.json({ error: "APP_URL is not configured" }, { status: 400 });
  try {
    const definitions = [
      ["ORDERS_CREATE", `${appUrl}/api/shopify/webhooks/orders-create`],
      ["ORDERS_UPDATED", `${appUrl}/api/shopify/webhooks/orders-updated`],
    ];
    const registered = [];
    for (const [topic, callbackUrl] of definitions) {
      const data = await shopifyAdmin<Result>(MUTATION, { topic, callbackUrl });
      const result = data.webhookSubscriptionCreate;
      if (result.userErrors.length) throw new Error(result.userErrors.map((error) => error.message).join(", "));
      registered.push(result.webhookSubscription);
    }
    return NextResponse.json({ ok: true, registered });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Webhook registration failed" }, { status: 500 });
  }
}
