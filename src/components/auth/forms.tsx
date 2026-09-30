"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  alterarSenhaAction,
  esqueciSenhaAction,
  loginAction,
  primeiroAcessoAction,
  type EstadoForm,
} from "@/actions/auth";
import { Aviso, Botao, Campo } from "@/components/ui";

function IconeGoogle() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 12 24 12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 16.3 4 9.6 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1 2.9-3.1 5.2-5.9 6.5l6.3 5.3C38.2 37.3 44 32 44 24c0-1.2-.1-2.3-.4-3.5z" />
    </svg>
  );
}

export function FormLogin({ aviso }: { aviso?: string }) {
  const [estado, action, pending] = useActionState(loginAction, null as EstadoForm);
  return (
    <div className="space-y-4">
      {aviso ? <Aviso>{aviso}</Aviso> : null}
      <a
        href="/api/auth/google"
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50"
      >
        <IconeGoogle />
        Entrar com Google
      </a>
        <p className="text-center text-xs text-zinc-500">
          Conta @ifsc.edu.br ou @aluno.ifsc.edu.br. O e-mail e a senha são informados na página do Google.
        </p>
      <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-zinc-400">
        <span className="h-px flex-1 bg-zinc-200" />
        ou com senha
        <span className="h-px flex-1 bg-zinc-200" />
      </div>
      <form action={action} className="space-y-4">
        {estado?.erro ? <Aviso>{estado.erro}</Aviso> : null}
        <Campo label="E-mail institucional" name="email" type="email" required autoComplete="username" />
        <Campo label="Senha" name="senha" type="password" required autoComplete="current-password" />
        <Botao type="submit" className="w-full" disabled={pending}>
          {pending ? "Entrando..." : "Entrar"}
        </Botao>
        <p className="text-center text-sm text-zinc-600">
          <Link href="/esqueci-senha" className="font-semibold text-ifsc">
            Esqueceu a senha?
          </Link>
        </p>
        <p className="text-center text-sm text-zinc-600">
          Primeiro acesso?{" "}
          <Link href="/primeiro-acesso" className="font-semibold text-ifsc">
            Entrar com a matrícula
          </Link>
        </p>
      </form>
    </div>
  );
}

export function FormPrimeiroAcesso() {
  const [estado, action, pending] = useActionState(
    primeiroAcessoAction,
    null as EstadoForm,
  );
  return (
    <form action={action} className="space-y-4">
      {estado?.erro ? <Aviso>{estado.erro}</Aviso> : null}
      <Campo label="Matrícula" name="matricula" required autoComplete="username" />
      <Botao type="submit" className="w-full" disabled={pending}>
        {pending ? "Verificando..." : "Continuar"}
      </Botao>
      <p className="text-center text-sm text-zinc-600">
        Já tem senha?{" "}
        <Link href="/login" className="font-semibold text-ifsc">
          Entrar
        </Link>
      </p>
    </form>
  );
}

export function FormAlterarSenha() {
  const [estado, action, pending] = useActionState(
    alterarSenhaAction,
    null as EstadoForm,
  );
  return (
    <form action={action} className="space-y-4">
      {estado?.erro ? <Aviso>{estado.erro}</Aviso> : null}
      <Campo
        label="Nova senha"
        name="senha"
        type="password"
        required
        minLength={6}
        autoComplete="new-password"
      />
      <Campo
        label="Confirmar senha"
        name="confirmar"
        type="password"
        required
        minLength={6}
        autoComplete="new-password"
      />
      <Botao type="submit" className="w-full" disabled={pending}>
        {pending ? "Salvando..." : "Salvar senha"}
      </Botao>
    </form>
  );
}

export function FormEsqueciSenha() {
  const [estado, action, pending] = useActionState(
    esqueciSenhaAction,
    null as EstadoForm,
  );
  return (
    <form action={action} className="space-y-4">
      {estado?.erro ? <Aviso>{estado.erro}</Aviso> : null}
      {estado?.ok ? <Aviso tipo="ok">{estado.mensagem}</Aviso> : null}
      <Campo label="Matrícula" name="matricula" required autoComplete="username" />
      <Campo label="E-mail institucional" name="email" type="email" required />
      <Botao type="submit" className="w-full" disabled={pending}>
        {pending ? "Enviando..." : "Enviar senha por e-mail"}
      </Botao>
      <p className="text-center text-sm text-zinc-600">
        Lembrou a senha?{" "}
        <Link href="/login" className="font-semibold text-ifsc">
          Entrar
        </Link>
      </p>
    </form>
  );
}
