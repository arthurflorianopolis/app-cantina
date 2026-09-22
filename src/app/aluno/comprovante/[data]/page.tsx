import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { exigirSessao } from "@/lib/auth";
import { formatarData, podeReservar } from "@/lib/regras";
import { gerarQrDataUrl } from "@/lib/qr";
import { PageShell } from "@/components/ui";
import { QrComprovante } from "@/components/aluno/qr-comprovante";
import { FormCancelar } from "@/components/aluno/forms";

export default async function ComprovantePage({
  params,
}: {
  params: Promise<{ data: string }>;
}) {
  const { data } = await params;
  const sessao = await exigirSessao("ALUNO");
  const usuario = await prisma.usuario.findUnique({
    where: { id: sessao.sub },
    include: { matricula: true },
  });
  if (!usuario?.matricula) notFound();

  const cardapio = await prisma.cardapio.findUnique({ where: { data } });
  if (!cardapio) notFound();

  const reserva = await prisma.reserva.findUnique({
    where: {
      matriculaId_cardapioId: {
        matriculaId: usuario.matricula.id,
        cardapioId: cardapio.id,
      },
    },
  });

  if (!reserva || reserva.status === "CANCELADA") notFound();

  const imagem = await gerarQrDataUrl(reserva.qrToken);

  return (
    <PageShell titulo="Comprovante" descricao="Apresente este QR na cantina.">
      <div className="mx-auto max-w-md space-y-4">
        <QrComprovante
          imagem={imagem}
          nome={usuario.nome}
          data={formatarData(data)}
          prato={cardapio.descricao}
        />
        {reserva.status === "CONSUMIDA" ? (
          <p className="text-center text-sm font-medium text-ifsc">
            Esta refeição já foi confirmada.
          </p>
        ) : podeReservar(data) ? (
          <FormCancelar data={data} />
        ) : null}
      </div>
    </PageShell>
  );
}
