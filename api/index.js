export const config = {
  runtime: "edge",
};

// Usamos o domínio em vez do IP para a Vercel aceitar a conexão
const TARGET_DOMAIN = "jkvercel.jkinfinitenet.com";
const TARGET_URL = `https://${TARGET_DOMAIN}:443`;

export default async function handler(req) {
  const url = new URL(req.url);

  try {
    const destination = TARGET_URL + url.pathname + url.search;
    
    const newHeaders = new Headers(req.headers);
    
    // O Host deve ser o seu domínio da VPS
    newHeaders.set("Host", TARGET_DOMAIN);
    
    // Remove headers de proteção da Vercel para liberar o tráfego
    newHeaders.delete("x-vercel-id");
    newHeaders.delete("x-vercel-proxy-signature");
    newHeaders.delete("x-vercel-protection-bypass");
    newHeaders.delete("connection");

    // Executa o fetch com streaming (duplex: half)
    const response = await fetch(destination, {
      method: req.method,
      headers: newHeaders,
      body: req.method !== "GET" && req.method !== "HEAD" ? req.body : undefined,
      redirect: "manual",
      duplex: "half", 
    });

    // Retorna a resposta. No navegador deve aparecer "400 Bad Request"
    return response;

  } catch (error) {
    // Se der erro aqui, tente mudar o TARGET_URL para http (se o Xray permitir)
    return new Response("ERRO_AO_CONECTAR_VPS: Verifique se o domínio está apontando para o IP correto", { status: 502 });
  }
}
