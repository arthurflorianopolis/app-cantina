import nodemailer from "nodemailer";

export function emailConfigurado() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_FROM);
}

function transportador() {
  const host = process.env.SMTP_HOST;
  const from = process.env.SMTP_FROM;
  if (!host || !from) {
    throw new Error("SMTP_HOST e SMTP_FROM não configurados.");
  }

  const port = Number(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();

  return nodemailer.createTransport({
    host,
    port,
    secure: process.env.SMTP_SECURE === "true" || port === 465,
    auth: user && pass ? { user, pass } : undefined,
  });
}

export async function enviarSenhaTemporaria(para: string, nome: string, senha: string) {
  const from = process.env.SMTP_FROM!;
  await transportador().sendMail({
    from,
    to: para,
    subject: "Cantina IFSC — senha temporária",
    text: [
      `Olá, ${nome}.`,
      "",
      "Recebemos um pedido de nova senha no app da cantina.",
      `Sua senha temporária é: ${senha}`,
      "",
      "Entre com seu e-mail institucional e essa senha. O sistema vai pedir para você criar uma senha nova.",
      "",
      "Se você não pediu isso, avise a administração do câmpus.",
    ].join("\n"),
  });
}
