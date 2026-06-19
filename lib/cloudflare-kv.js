const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const NAMESPACE_ID = process.env.CLOUDFLARE_KV_NAMESPACE_ID;
const TOKEN = process.env.CLOUDFLARE_API_TOKEN;

function isReady() {
  return Boolean(ACCOUNT_ID && NAMESPACE_ID && TOKEN);
}

function baseUrl() {
  return `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${NAMESPACE_ID}`;
}

function authHeaders(extra = {}) {
  return {
    Authorization: `Bearer ${TOKEN}`,
    ...extra,
  };
}

export async function kvGetJson(key) {
  if (!isReady()) return null;

  const res = await fetch(`${baseUrl()}/values/${encodeURIComponent(key)}`, {
    headers: authHeaders(),
  });

  if (res.status === 404) return null;
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`KV GET failed: ${res.status} ${text.slice(0, 200)}`);
  }

  const raw = await res.text();
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function kvSetJson(key, value, ttlSeconds = 86400) {
  if (!isReady()) return false;

  const res = await fetch(
    `${baseUrl()}/values/${encodeURIComponent(key)}?expiration_ttl=${ttlSeconds}`,
    {
      method: 'PUT',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(value),
    }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`KV PUT failed: ${res.status} ${text.slice(0, 200)}`);
  }

  return true;
}