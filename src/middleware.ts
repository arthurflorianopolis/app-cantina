import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { COOKIE_SESSAO } from "@/lib/auth";
import type { Papel } from "@prisma/client";

function destino(papel: Papel) {
  if (papel === "ADMIN") return "/admin";
  if (papel === "CANTINA") return "/cantina";
  return "/aluno";
}

async function sessaoDoPedido(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESSAO)?.value;
  if (!token || !process.env.AUTH_SECRET) return null;
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.AUTH_SECRET),
    );
    if (!payload.sub) return null;
    return {
      sub: payload.sub,
      papel: payload.papel as Papel,
    };
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const sessao = await sessaoDoPedido(req);
  const publica = pathname === "/login" || pathname === "/primeiro-acesso";

  if (publica) {
    if (sessao) {
      return NextResponse.redirect(new URL(destino(sessao.papel), req.url));
    }
    return NextResponse.next();
  }

  if (!sessao) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (pathname.startsWith("/admin") && sessao.papel !== "ADMIN") {
    return NextResponse.redirect(new URL(destino(sessao.papel), req.url));
  }

  if (
    pathname.startsWith("/cantina") &&
    sessao.papel !== "CANTINA" &&
    sessao.papel !== "ADMIN"
  ) {
    return NextResponse.redirect(new URL(destino(sessao.papel), req.url));
  }

  if (pathname.startsWith("/aluno") && sessao.papel !== "ALUNO") {
    return NextResponse.redirect(new URL(destino(sessao.papel), req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/primeiro-acesso", "/aluno/:path*", "/cantina/:path*", "/admin/:path*"],
};
