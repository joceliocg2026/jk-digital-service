export const config = {
  runtime: "edge",
};

// Domínio que aponta para sua VPS
const TARGET_DOMAIN = "jkvercel.jkinfinitenet.com";
const TARGET_URL = `https://${TARGET_DOMAIN}:443`;

export default async function handler(req) {
  const url = new URL(req.url);

  try {
    const destination = TARGET_URL + url.pathname + url.search;
    
    const newHeaders = new Headers(req.headers);
    
    // O Host deve ser o domínio configurado no certificado da VPS
    newHeaders.set("Host", TARGET_DOMAIN);
    
    // Limpeza total de headers da Vercel para evitar o Erro 403
    newHeaders.delete("x-vercel-id");
    newHeaders.delete("x-vercel-proxy-signature");
    newHeaders.delete("x-vercel-protection-bypass");
    newHeaders.delete("connection");

    // Fetch com HTTPS e streaming (duplex: half)
    const response = await fetch(destination, {
      method: req.method,
      headers: newHeaders,
      body: req.method !== "GET" && req.method !== "HEAD" ? req.body : undefined,
      redirect: "manual",
      duplex: "half", 
    });

    // Retorna a resposta bruta. 
    // No navegador, deve aparecer "400 Bad Request" (Sucesso de conexão)
    return response;

  } catch (error) {
    // Se der esse erro, a Vercel não confia no certificado SSL da VPS
    return new Response("ERRO_HANDSHAKE_SSL", { status: 502 });
  }
}
