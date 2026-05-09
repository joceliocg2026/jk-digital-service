export const config = {
  runtime: "edge",
};

/**
 * RELAY JK INFINITE - SOLUÇÃO DEFINITIVA SSL/XHTTP
 */

const TARGET_DOMAIN = "jkvercel.jkinfinitenet.com";
const TARGET_URL = `https://${TARGET_DOMAIN}:443`;

export default async function handler(req) {
  const url = new URL(req.url);

  try {
    const destination = TARGET_URL + url.pathname + url.search;
    
    // Clonamos os headers para não perder as credenciais do XHTTP/VLESS
    const newHeaders = new Headers(req.headers);
    
    // Ajustes de Host e Segurança
    newHeaders.set("Host", TARGET_DOMAIN);
    
    // Removemos os headers que fazem a Vercel filtrar a conexão
    newHeaders.delete("x-vercel-id");
    newHeaders.delete("x-vercel-proxy-signature");
    newHeaders.delete("x-vercel-protection-bypass");
    newHeaders.delete("connection");

    // O fetch no Edge Runtime não permite ignorar SSL explicitamente via flag,
    // então usamos o redirecionamento manual para tentar o handshake direto.
    const response = await fetch(destination, {
      method: req.method,
      headers: newHeaders,
      body: req.method !== "GET" && req.method !== "HEAD" ? req.body : undefined,
      redirect: "manual",
      duplex: "half", 
    });

    // Se a VPS responder, repassamos exatamente o que ela disse
    // (Isso deve gerar o Erro 400 no navegador, que é o que queremos)
    return response;

  } catch (error) {
    // Se ainda der erro de SSL, tentamos via HTTP (porta 443 aceita as vezes dependendo do Xray)
    try {
      const fallbackUrl = `http://${TARGET_DOMAIN}:443${url.pathname}${url.search}`;
      return await fetch(fallbackUrl, {
        method: req.method,
        headers: req.headers,
        body: req.method !== "GET" && req.method !== "HEAD" ? req.body : undefined,
        duplex: "half"
      });
    } catch (e) {
      return new Response("ERRO_TOTAL_CONEXAO: Verifique o Firewall da VPS", { status: 502 });
    }
  }
}
