import http from "node:http";
import https from "node:https";
import fs from "node:fs";

const destino = { hostname: "127.0.0.1", port: 3000 };
const cert = fs.readFileSync(process.env.TLS_CERT || "/data/tls.crt");
const key = fs.readFileSync(process.env.TLS_KEY || "/data/tls.key");

function encaminhar(proto) {
  return (pedido, resposta) => {
    const hostPublico = String(pedido.headers.host || "172.16.110.6").replace(/:\d+$/, "");
    const headers = {
      ...pedido.headers,
      host: hostPublico,
      "x-forwarded-host": hostPublico,
      "x-forwarded-proto": proto,
      "x-forwarded-for": pedido.socket.remoteAddress || "",
    };
    delete headers.connection;

    const proxy = http.request(
      {
        ...destino,
        path: pedido.url,
        method: pedido.method,
        headers,
      },
      (volta) => {
        resposta.writeHead(volta.statusCode || 502, volta.headers);
        volta.pipe(resposta);
      },
    );
    proxy.on("error", () => {
      if (!resposta.headersSent) resposta.writeHead(502);
      resposta.end("Serviço iniciando, tente de novo.");
    });
    pedido.pipe(proxy);
  };
}

http.createServer(encaminhar("http")).listen(80, "0.0.0.0");
https.createServer({ key, cert }, encaminhar("https")).listen(443, "0.0.0.0");
