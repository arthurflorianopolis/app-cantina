import http from "node:http";
import https from "node:https";
import fs from "node:fs";

const destino = { hostname: "127.0.0.1", port: 3000 };
const cert = fs.readFileSync(process.env.TLS_CERT || "/data/tls.crt");
const key = fs.readFileSync(process.env.TLS_KEY || "/data/tls.key");

function encaminhar(pedido, resposta) {
  const headers = { ...pedido.headers, host: "127.0.0.1:3000" };
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
}

http.createServer(encaminhar).listen(80, "0.0.0.0");
https.createServer({ key, cert }, encaminhar).listen(443, "0.0.0.0");
