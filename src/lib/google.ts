import bcrypt from "bcryptjs";
import { timingSafeEqual } from "node:crypto";
import { createRemoteJWKSet, jwtVerify, SignJWT } from "jose";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { COOKIE_SESSAO, destinoAposLogin, opcoesCookieSessao, tokenDaSessao } from "@/lib/auth";
import { emailInstitucional } from "@/lib/regras";

const COOKIE_OAUTH = "cantina_oauth_google";
const DOMINIOS = new Set(["ifsc.edu.br", "aluno.ifsc.edu.br"]);
const JWKS = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));

export function googleConfigurado() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

function segredo() {
  const valor = process.env.AUTH_SECRET;
  if (!valor) throw new Error("AUTH_SECRET não configurado");
  return new TextEncoder().encode(valor);
}

function urlAplicacao(req: NextRequest) {
  const configurada = process.env.APP_URL?.trim().replace(/\/$/, "");
  if (configurada && !/localhost|127\.0\.0\.1|0\.0\.0\.0/.test(configurada)) {
    return configurada;
  }

  const host = (req.headers.get("x-forwarded-host") || req.headers.get("host") || "")
    .split(",")[0]
    .trim();
  const proto = (req.headers.get("x-forwarded-proto") || "http").split(",")[0].trim() || "http";
  if (host && !host.startsWith("0.0.0.0") && !host.startsWith("127.0.0.1")) {
    return `${proto}://${host}`;
  }

  if (configurada) return configurada;
  return req.nextUrl.origin;
}

function callbackUrl(req: NextRequest) {
  return `${urlAplicacao(req)}/api/auth/google/callback`;
}

function opcoesCookieOAuth() {
  return {
    httpOnly: true as const,
    sameSite: "lax" as const,
    path: "/",
    secure: process.env.COOKIE_SECURE === "true",
    maxAge: 60 * 10,
  };
}

function textosIguais(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

function redirecionarLogin(req: NextRequest, erro: string) {
  const resposta = NextResponse.redirect(new URL(`/login?erro=${erro}`, urlAplicacao(req)));
  resposta.cookies.set(COOKIE_OAUTH, "", { ...opcoesCookieOAuth(), maxAge: 0 });
  return resposta;
}

export async function iniciarLoginGoogle(req: NextRequest) {
  if (!googleConfigurado()) {
    return redirecionarLogin(req, "google-indisponivel");
  }

  const state = crypto.randomUUID();
  const token = await new SignJWT({ tipo: "google" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(state)
    .setIssuedAt()
    .setExpirationTime("10m")
    .sign(segredo());

  const destino = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  destino.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID!);
  destino.searchParams.set("redirect_uri", callbackUrl(req));
  destino.searchParams.set("response_type", "code");
  destino.searchParams.set("scope", "openid email profile");
  destino.searchParams.set("state", state);
  destino.searchParams.set("prompt", "select_account");

  const resposta = NextResponse.redirect(destino);
  resposta.cookies.set(COOKIE_OAUTH, token, opcoesCookieOAuth());
  return resposta;
}

async function emailDoGoogle(
  code: string,
  req: NextRequest,
): Promise<{ email: string; nome: string } | { erro: "google-dominio" }> {
  const corpo = new URLSearchParams({
    code,
    client_id: process.env.GOOGLE_CLIENT_ID!,
    client_secret: process.env.GOOGLE_CLIENT_SECRET!,
    redirect_uri: callbackUrl(req),
    grant_type: "authorization_code",
  });

  const troca = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: corpo,
  });
  if (!troca.ok) {
    throw new Error("troca");
  }

  const dados = (await troca.json()) as { id_token?: string };
  if (!dados.id_token) throw new Error("sem-id-token");

  const { payload } = await jwtVerify(dados.id_token, JWKS, {
    issuer: ["https://accounts.google.com", "accounts.google.com"],
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const email = String(payload.email ?? "").trim().toLowerCase();
  const verificado = payload.email_verified === true || payload.email_verified === "true";
  const hd = String(payload.hd ?? "");
  const nome = String(payload.name ?? "").trim() || email.split("@")[0] || email;

  if (!verificado || !emailInstitucional(email) || !DOMINIOS.has(hd)) {
    return { erro: "google-dominio" };
  }

  return { email, nome };
}

export async function concluirLoginGoogle(req: NextRequest) {
  const erroGoogle = req.nextUrl.searchParams.get("error");
  if (erroGoogle) {
    return redirecionarLogin(req, erroGoogle === "access_denied" ? "google-negado" : "google-falhou");
  }

  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const cookie = req.cookies.get(COOKIE_OAUTH)?.value;
  if (!googleConfigurado() || !code || !state || !cookie) {
    return redirecionarLogin(req, "google-falhou");
  }

  try {
    const { payload } = await jwtVerify(cookie, segredo());
    if (payload.tipo !== "google" || !payload.sub || !textosIguais(payload.sub, state)) {
      return redirecionarLogin(req, "google-falhou");
    }
  } catch {
    return redirecionarLogin(req, "google-falhou");
  }

  let email: string;
  let nome: string;
  try {
    const resultado = await emailDoGoogle(code, req);
    if ("erro" in resultado) {
      return redirecionarLogin(req, resultado.erro);
    }
    email = resultado.email;
    nome = resultado.nome;
  } catch {
    return redirecionarLogin(req, "google-falhou");
  }

  const registro = await prisma.matricula.findFirst({
    where: { email, ativa: true },
  });

  let usuario = await prisma.usuario.findUnique({ where: { email } });
  if (!usuario && registro) {
    usuario = await prisma.usuario.findFirst({ where: { matriculaId: registro.id } });
  }

  if (!usuario) {
    usuario = await prisma.usuario.create({
      data: {
        email,
        senhaHash: await bcrypt.hash(crypto.randomUUID(), 10),
        nome: registro?.nome || nome,
        papel: "ALUNO",
        matriculaId: registro?.id,
        precisaTrocarSenha: false,
      },
    });
  } else if (usuario.precisaTrocarSenha || (usuario.papel === "ALUNO" && !usuario.matriculaId && registro)) {
    usuario = await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        precisaTrocarSenha: false,
        matriculaId: usuario.matriculaId ?? registro?.id,
        nome: usuario.papel === "ALUNO" ? registro?.nome || nome || usuario.nome : usuario.nome,
      },
    });
  }

  const sessao = {
    sub: usuario.id,
    papel: usuario.papel,
    nome: usuario.nome,
    email: usuario.email,
    precisaTrocarSenha: false,
  };
  const token = await tokenDaSessao(sessao);
  const resposta = NextResponse.redirect(new URL(destinoAposLogin(sessao), urlAplicacao(req)));
  resposta.cookies.set(COOKIE_SESSAO, token, opcoesCookieSessao());
  resposta.cookies.set(COOKIE_OAUTH, "", { ...opcoesCookieOAuth(), maxAge: 0 });
  return resposta;
}
