"use client";

import { usePathname } from "next/navigation";
import {
  avancarDiaTesteAction,
  reiniciarTesteAction,
  voltarDiaRealAction,
} from "@/actions/relogio";
import { Botao } from "@/components/ui";

export function RelogioTeste({
  hoje,
  simulado,
}: {
  hoje: string;
  simulado: boolean;
}) {
  const pathname = usePathname();

  return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
      <h2 className="font-semibold text-amber-950">Teste sem esperar o dia virar</h2>
      <p className="mt-1 text-sm text-amber-900/80">
        O QR só vale no dia da refeição. Para testar o escanear agora, avance o relógio
        do app. O horário do relógio real (incluindo o limite das 22h) continua valendo.
      </p>
      <p className="mt-2 text-sm font-medium text-amber-950">
        Hoje no app: {hoje}
        {simulado ? " (simulado)" : ""}
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <form action={avancarDiaTesteAction}>
          <input type="hidden" name="voltarPara" value={pathname} />
          <Botao type="submit">Avançar um dia</Botao>
        </form>
        {simulado ? (
          <form action={voltarDiaRealAction}>
            <input type="hidden" name="voltarPara" value={pathname} />
            <Botao type="submit" variant="secondary">
              Voltar ao dia real
            </Botao>
          </form>
        ) : null}
        <form
          action={reiniciarTesteAction}
          onSubmit={(evento) => {
            if (
              !confirm(
                "Isso apaga todos os cardápios e reservas e volta o relógio para o dia real. Os logins continuam. Começar de novo?",
              )
            ) {
              evento.preventDefault();
            }
          }}
        >
          <input type="hidden" name="voltarPara" value={pathname} />
          <Botao type="submit" variant="danger">
            Começar tudo novamente
          </Botao>
        </form>
      </div>
    </section>
  );
}
