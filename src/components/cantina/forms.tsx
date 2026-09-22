"use client";

import { useActionState, useTransition } from "react";
import {
  confirmarPorMatriculaAction,
  inclusaoManualAction,
  type EstadoCantina,
} from "@/actions/cantina";
import { Aviso, Botao, Campo } from "@/components/ui";

export function BotaoConfirmar({ matricula }: { matricula: string }) {
  const [pending, start] = useTransition();

  return (
    <Botao
      disabled={pending}
      onClick={() => {
        start(async () => {
          const resposta = await confirmarPorMatriculaAction(matricula);
          if (resposta?.erro) {
            window.alert(resposta.erro);
            return;
          }
          window.location.reload();
        });
      }}
    >
      {pending ? "Confirmando..." : "Confirmar consumo"}
    </Botao>
  );
}

export function FormInclusaoManual({ matriculaInicial = "" }: { matriculaInicial?: string }) {
  const [estado, action, pending] = useActionState(
    inclusaoManualAction,
    null as EstadoCantina,
  );
  return (
    <form action={action} className="space-y-4">
      {estado?.erro ? <Aviso>{estado.erro}</Aviso> : null}
      {estado?.ok ? <Aviso tipo="ok">{estado.mensagem}</Aviso> : null}
      <Campo
        label="Matrícula"
        name="matricula"
        defaultValue={matriculaInicial}
        required
      />
      <Campo
        label="Motivo"
        name="motivo"
        required
        placeholder="Esqueceu de reservar, QR não leu, autorizado..."
      />
      <Botao type="submit" disabled={pending}>
        {pending ? "Incluindo..." : "Incluir e confirmar"}
      </Botao>
    </form>
  );
}
