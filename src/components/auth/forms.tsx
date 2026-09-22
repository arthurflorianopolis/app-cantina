"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, primeiroAcessoAction, type EstadoForm } from "@/actions/auth";
import { Aviso, Botao, Campo } from "@/components/ui";

export function FormLogin() {
  const [estado, action, pending] = useActionState(loginAction, null as EstadoForm);
  return (
    <form action={action} className="space-y-4">
      {estado?.erro ? <Aviso>{estado.erro}</Aviso> : null}
      <Campo label="E-mail institucional" name="email" type="email" required autoComplete="username" />
      <Campo label="Senha" name="senha" type="password" required autoComplete="current-password" />
      <Botao type="submit" className="w-full" disabled={pending}>
        {pending ? "Entrando..." : "Entrar"}
      </Botao>
      <p className="text-center text-sm text-zinc-600">
        Primeiro acesso?{" "}
        <Link href="/primeiro-acesso" className="font-semibold text-ifsc">
          Criar senha com a matrícula
        </Link>
      </p>
    </form>
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
      <Campo label="Matrícula" name="matricula" required />
      <Campo label="E-mail institucional" name="email" type="email" required />
      <Campo label="Senha" name="senha" type="password" required minLength={6} />
      <Campo label="Confirmar senha" name="confirmar" type="password" required minLength={6} />
      <Botao type="submit" className="w-full" disabled={pending}>
        {pending ? "Criando..." : "Criar acesso"}
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
