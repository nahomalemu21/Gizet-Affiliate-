type ShopifyGraphqlResponse<T> = { data?: T; errors?: Array<{ message: string }> };

type ShopifyAccessTokenResponse = {
  access_token?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
};

let cachedAccessToken: { token: string; expiresAt: number } | undefined;
let accessTokenRequest: Promise<string> | undefined;

function shopDomain() {
  const value = process.env.SHOPIFY_STORE_DOMAIN;
  if (!value) throw new Error("SHOPIFY_STORE_DOMAIN is not configured");
  return value.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

async function requestClientCredentialsToken(clientId: string, clientSecret: string) {
  const response = await fetch(`https://${shopDomain()}/admin/oauth/access_token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    }).toString(),
    cache: "no-store",
  });

  const json = (await response.json()) as ShopifyAccessTokenResponse;
  if (!response.ok || !json.access_token) {
    throw new Error(
      json.error_description || json.error || `Shopify access token request failed (${response.status})`,
    );
  }

  const expiresInSeconds = Number(json.expires_in);
  if (Number.isFinite(expiresInSeconds) && expiresInSeconds > 0) {
    cachedAccessToken = {
      token: json.access_token,
      expiresAt: Date.now() + Math.max(expiresInSeconds * 1000 - 60_000, 0),
    };
  }

  return json.access_token;
}

async function shopifyAdminAccessToken() {
  if (cachedAccessToken && Date.now() < cachedAccessToken.expiresAt) {
    return cachedAccessToken.token;
  }

  const clientId = process.env.SHOPIFY_CLIENT_ID;
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    const fallbackToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
    if (fallbackToken) return fallbackToken;
    throw new Error(
      "SHOPIFY_CLIENT_ID and SHOPIFY_CLIENT_SECRET are not configured, and SHOPIFY_ADMIN_ACCESS_TOKEN fallback is not configured",
    );
  }

  if (!accessTokenRequest) {
    accessTokenRequest = requestClientCredentialsToken(clientId, clientSecret).finally(() => {
      accessTokenRequest = undefined;
    });
  }

  return accessTokenRequest;
}

export async function shopifyAdmin<T>(query: string, variables: Record<string, unknown> = {}) {
  const token = await shopifyAdminAccessToken();
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
