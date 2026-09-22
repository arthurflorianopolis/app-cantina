import { prisma } from "@/lib/prisma";
import { exigirSessao } from "@/lib/auth";
import { amanhaISO, formatarData, formatarDataCurta, hojeISO } from "@/lib/regras";
import { Card, PageShell } from "@/components/ui";
import { FormCardapio } from "@/components/admin/forms";

export default async function CantinaCardapioPage() {
  await exigirSessao("CANTINA", "ADMIN");
  const amanha = amanhaISO();
  const hoje = hojeISO();
  const cardapioAmanha = await prisma.cardapio.findUnique({ where: { data: amanha } });
  const cardapios = await prisma.cardapio.findMany({
    orderBy: { data: "desc" },
    take: 14,
  });

  return (
    <PageShell
      titulo="Cardápio"
      descricao={`Se houver refeição amanhã (${formatarData(amanha)}), escreva o prato e salve. Se não houver, deixe o campo vazio e salve para retirar a publicação.`}
    >
      <div className="grid gap-6 md:grid-cols-[minmax(0,360px)_1fr]">
        <Card>
          <FormCardapio
            dataInicial={amanha}
            descricaoInicial={cardapioAmanha?.descricao}
            somenteAmanha
            rotuloData={formatarData(amanha)}
          />
        </Card>
        <Card>
          <h2 className="mb-3 font-semibold">Publicados</h2>
          <ul className="space-y-3 text-sm">
            {cardapios.length === 0 ? (
              <li className="text-zinc-500">Nenhum cardápio cadastrado ainda.</li>
            ) : (
              cardapios.map((item) => (
                <li key={item.id} className="border-b border-zinc-100 pb-3">
                  <p className="font-medium">
                    {formatarDataCurta(item.data)}
                    {item.data === hoje ? " · hoje" : ""}
                    {item.data === amanha ? " · amanhã" : ""}
                  </p>
                  <p className="text-zinc-600">{item.descricao}</p>
                </li>
              ))
            )}
          </ul>
        </Card>
      </div>
    </PageShell>
  );
}
