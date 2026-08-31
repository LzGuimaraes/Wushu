/**
 * Origens permitidas para acessar a API (CORS + guarda de origem).
 * Apenas o frontend oficial (DOMAIN_WEB/FRONTEND_URL) e o ambiente de
 * desenvolvimento (localhost) devem conseguir chamar endpoints públicos
 * sensíveis, como o cadastro de novos usuários.
 */

const LOCAL_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173'];

/** Extrai a `origin` (ex.: `https://exemplo.com`) de uma URL, se válida. */
function toOrigin(url: string): string | null {
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

/** Lista completa de origens liberadas (sem duplicatas). */
export function getAllowedOrigins(): string[] {
  const configured = [
    process.env.DOMAIN_WEB,
    process.env.FRONTEND_URL,
    process.env.APP_URL,
  ]
    .filter((value): value is string => Boolean(value))
    .map(toOrigin)
    .filter((origin): origin is string => Boolean(origin));

  return [...new Set([...configured, ...LOCAL_ORIGINS])];
}

/**
 * Indica se uma origem é permitida.
 * Em desenvolvimento (sem DOMAIN_WEB/FRONTEND_URL configurado), qualquer
 * origem localhost/127.0.0.1 é aceita para facilitar o trabalho local.
 */
export function isAllowedOrigin(origin?: string): boolean {
  if (!origin) return false;

  if (getAllowedOrigins().includes(origin)) return true;

  const isDev = !process.env.DOMAIN_WEB && !process.env.FRONTEND_URL;
  if (isDev) {
    try {
      const hostname = new URL(origin).hostname;
      return hostname === 'localhost' || hostname === '127.0.0.1';
    } catch {
      return false;
    }
  }

  return false;
}
