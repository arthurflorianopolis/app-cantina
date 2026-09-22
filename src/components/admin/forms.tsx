"use client";

import { useActionState } from "react";
import {
  criarOperadorAction,
  importarMatriculasAction,
  salvarCardapioAction,
  type EstadoAdmin,
} from "@/actions/admin";
import { AreaTexto, Aviso, Botao, Campo } from "@/components/ui";

export function FormImportarCsv() {
  const [estado, action, pending] = useActionState(
    importarMatriculasAction,
    null as EstadoAdmin,
  );
  return (
    <form action={action} className="space-y-4">
      {estado?.erro ? <Aviso>{estado.erro}</Aviso> : null}
      {estado?.ok ? <Aviso tipo="ok">{estado.mensagem}</Aviso> : null}
      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-zinc-700">Arquivo CSV</span>
        <input
          type="file"
          name="arquivo"
          accept=".csv,text/csv"
          required
          className="block w-full text-sm"
        />
      </label>
      <p className="text-xs text-zinc-500">Colunas: matricula, email, nome</p>
      <Botao type="submit" disabled={pending}>
        {pending ? "Importando..." : "Importar lista"}
      </Botao>
    </form>
  );
}

export function FormCardapio({
  dataInicial,
  descricaoInicial,
  somenteAmanha = false,
  rotuloData,
}: {
  dataInicial?: string;
  descricaoInicial?: string;
  somenteAmanha?: boolean;
  rotuloData?: string;
}) {
  const [estado, action, pending] = useActionState(
    salvarCardapioAction,
    null as EstadoAdmin,
  );
  return (
    <form action={action} className="space-y-4">
      {estado?.erro ? <Aviso>{estado.erro}</Aviso> : null}
      {estado?.ok ? <Aviso tipo="ok">{estado.mensagem}</Aviso> : null}
      {somenteAmanha ? (
        <>
          <input type="hidden" name="data" value={dataInicial} />
          <p className="text-sm text-zinc-600">
            <span className="font-medium text-zinc-800">Amanhã</span>
            {rotuloData ? ` — ${rotuloData}` : ""}
          </p>
          <p className="text-xs text-zinc-500">
            Não é obrigatório. Deixe vazio e salve, ou use “Deixar sem refeição amanhã”.
          </p>
        </>
      ) : (
        <Campo label="Dia da refeição" name="data" type="date" defaultValue={dataInicial} required />
      )}
      <AreaTexto
        label="O que será servido"
        name="descricao"
        defaultValue={descricaoInicial}
        required={!somenteAmanha}
        placeholder={somenteAmanha ? "Deixe vazio se não houver refeição" : undefined}
      />
      <Botao type="submit" disabled={pending}>
        {pending
          ? "Salvando..."
          : somenteAmanha
            ? "Publicar cardápio de amanhã"
            : "Salvar cardápio"}
      </Botao>
      {somenteAmanha && descricaoInicial ? (
        <Botao type="submit" name="retirar" value="1" variant="secondary" disabled={pending}>
          Deixar sem refeição amanhã
        </Botao>
      ) : null}
    </form>
  );
}

export function FormOperador() {
  const [estado, action, pending] = useActionState(
    criarOperadorAction,
    null as EstadoAdmin,
  );
  return (
    <form action={action} className="space-y-4">
      {estado?.erro ? <Aviso>{estado.erro}</Aviso> : null}
      {estado?.ok ? <Aviso tipo="ok">{estado.mensagem}</Aviso> : null}
      <Campo label="Nome" name="nome" required />
      <Campo label="E-mail institucional" name="email" type="email" required />
      <Campo label="Senha inicial" name="senha" type="password" required minLength={6} />
      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-zinc-700">Papel</span>
        <select
          name="papel"
          className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm"
          defaultValue="CANTINA"
        >
          <option value="CANTINA">Cantina</option>
          <option value="ADMIN">Administrador</option>
        </select>
      </label>
      <Botao type="submit" disabled={pending}>
        {pending ? "Criando..." : "Criar usuário"}
      </Botao>
    </form>
  );
}
