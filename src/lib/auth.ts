import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Papel } from "@prisma/client";

export const COOKIE_SESSAO = "cantina_sessao";

export type Sessao = {
  sub: string;
  papel: Papel;
  nome: string;
  email: string;
  precisaTrocarSenha: boolean;
};

function segredo() {
  const valor = process.env.AUTH_SECRET;
  if (!valor) {
    throw new Error("AUTH_SECRET não configurado");
  }
  return new TextEncoder().encode(valor);
}

export function destinoDoPapel(papel: Papel) {
  if (papel === "ADMIN") return "/admin";
  if (papel === "CANTINA") return "/cantina";
  return "/aluno";
}

export function destinoAposLogin(sessao: Pick<Sessao, "papel" | "precisaTrocarSenha">) {
  if (sessao.precisaTrocarSenha) return "/alterar-senha";
  return destinoDoPapel(sessao.papel);
}

export function opcoesCookieSessao() {
  return {
    httpOnly: true as const,
    sameSite: "lax" as const,
    path: "/",
    // Só use cookie Secure quando o site estiver em HTTPS (COOKIE_SECURE=true).
    // Na VM em http://172.16.110.6 o Chrome/celular descarta o cookie e a
    // próxima página (ex.: escanear) volta para o login.
    secure: process.env.COOKIE_SECURE === "true",
    maxAge: 60 * 60 * 24 * 7,
  };
}

export async function tokenDaSessao(sessao: Sessao) {
  return new SignJWT({
    papel: sessao.papel,
    nome: sessao.nome,
    email: sessao.email,
    precisaTrocarSenha: sessao.precisaTrocarSenha,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(sessao.sub)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(segredo());
}

export async function criarSessao(sessao: Sessao) {
  const token = await tokenDaSessao(sessao);
  const jar = await cookies();
  jar.set(COOKIE_SESSAO, token, opcoesCookieSessao());
}

export async function lerSessao(): Promise<Sessao | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_SESSAO)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, segredo());
    if (!payload.sub) return null;
    return {
      sub: payload.sub,
      papel: payload.papel as Papel,
      nome: String(payload.nome ?? ""),
      email: String(payload.email ?? ""),
      precisaTrocarSenha: Boolean(payload.precisaTrocarSenha),
    };
  } catch {
    return null;
  }
}

export async function exigirSessao(...papeis: Papel[]) {
  const sessao = await lerSessao();
  if (!sessao) redirect("/login");
  if (papeis.length > 0 && !papeis.includes(sessao.papel)) {
    redirect(destinoDoPapel(sessao.papel));
  }
  return sessao;
}

export async function encerrarSessao() {
  const jar = await cookies();
  jar.delete(COOKIE_SESSAO);
}
