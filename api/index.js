export const config = {
  runtime: "edge",
};

// Usando o domínio em vez do IP para evitar o erro "Direct IP access is not allowed"
const TARGET_DOMAIN = "jkvercel.jkinfinitenet.com";
const TARGET_PORT = "443";

export default async function handler(req) {
  try {
    const url = new URL(req.url);
    // Monta a URL de destino usando o domínio
    const destination = `http://${TARGET_DOMAIN}:${TARGET_PORT}${url.pathname}${url.search}`;

    const newHeaders = new Headers(req.headers);
    
    // O Host deve ser o domínio configurado na sua VPS
    newHeaders.set("Host", TARGET_DOMAIN);
    
    // Limpeza de headers para evitar o erro 403 da Vercel
    newHeaders.delete("x-vercel-id");
    newHeaders.delete("x-vercel-proxy-signature");
    newHeaders.delete("x-vercel-protection-bypass");
    newHeaders.delete("connection");

    // Executa o fetch com streaming habilitado (duplex half)
    const response = await fetch(destination, {
      method: req.method,
      headers: newHeaders,
      body: req.method !== "GET" && req.method !== "HEAD" ? req.body : undefined,
      redirect: "manual",
      duplex: "half", 
    });

    // Retorna a resposta bruta (Deve dar Erro 400 no navegador)
    return response;

  } catch (error) {
    // Se der 502, verifique se a porta 443 está aberta no Firewall da VPS
    return new Response("ERRO_LIGACAO_DOMINIO", { status: 502 });
  }
}
