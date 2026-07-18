type ShopifyGraphqlResponse<T> = { data?: T; errors?: Array<{ message: string }> };

function shopDomain() {
  const value = process.env.SHOPIFY_STORE_DOMAIN;
  if (!value) throw new Error("SHOPIFY_STORE_DOMAIN is not configured");
  return value.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

export async function shopifyAdmin<T>(query: string, variables: Record<string, unknown> = {}) {
  const token = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  if (!token) throw new Error("SHOPIFY_ADMIN_ACCESS_TOKEN is not configured");
  const version = process.env.SHOPIFY_API_VERSION || "2026-04";
  const response = await fetch(`https://${shopDomain()}/admin/api/${version}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });
  const json = (await response.json()) as ShopifyGraphqlResponse<T>;
  if (!response.ok || json.errors?.length) {
    throw new Error(json.errors?.map((error) => error.message).join(", ") || `Shopify request failed (${response.status})`);
  }
  if (!json.data) throw new Error("Shopify returned no data");
  return json.data;
}
