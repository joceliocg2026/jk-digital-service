export const config = {
  runtime: "edge",
};

const TARGET_DOMAIN = "jkvercel.jkinfinitenet.com";
const TARGET_PORT = "443";

export default async function handler(req) {
  const url = new URL(req.url);
  const path = url.pathname + url.search;

  const headers = new Headers(req.headers);
  headers.set("Host", TARGET_DOMAIN);
  
  // Limpeza de segurança para evitar 403
  headers.delete("x-vercel-id");
  headers.delete("x-vercel-proxy-signature");
  headers.delete("x-vercel-protection-bypass");
  headers.delete("connection");

  const fetchOptions = {
    method: req.method,
    headers: headers,
    body: req.method !== "GET" && req.method !== "HEAD" ? req.body : undefined,
    redirect: "manual",
    duplex: "half",
  };

  try {
    // TENTATIVA 1: HTTPS (O que estava dando erro de Handshake)
    return await fetch(`https://${TARGET_DOMAIN}:${TARGET_PORT}${path}`, fetchOptions);
  } catch (sslError) {
    try {
      // TENTATIVA 2: HTTP na porta 443 (Muitas vezes o Xray aceita se o SSL estiver em modo 'none')
      return await fetch(`http://${TARGET_DOMAIN}:${TARGET_PORT}${path}`, fetchOptions);
    } catch (httpError) {
      // TENTATIVA 3: Forçar via IP caso o DNS esteja falhando (Usando Host no header)
      const TARGET_IP = "137.131.143.111";
      try {
        return await fetch(`http://${TARGET_IP}:${TARGET_PORT}${path}`, {
          ...fetchOptions,
          headers: { ...Object.fromEntries(headers), Host: TARGET_DOMAIN }
        });
      } catch (lastError) {
        return new Response("ERRO_CRITICO: VPS Recusou todas as tentativas. Verifique se o Xray está rodando na porta 443.", { status: 502 });
      }
    }
  }
}
