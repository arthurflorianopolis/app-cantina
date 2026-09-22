import { prisma } from "@/lib/prisma";
import { exigirSessao } from "@/lib/auth";
import { amanhaISO, formatarDataCurta, hojeISO } from "@/lib/regras";
import { Card, PageShell } from "@/components/ui";
import { FormCardapio } from "@/components/admin/forms";

export default async function CardapioPage() {
  await exigirSessao("ADMIN");
  const cardapios = await prisma.cardapio.findMany({
    orderBy: { data: "desc" },
    take: 30,
  });

  return (
    <PageShell
      titulo="Cardápio"
      descricao="A cantina publica o cardápio de amanhã só quando houver refeição. Não precisa ser todo dia."
    >
      <div className="grid gap-6 md:grid-cols-[minmax(0,360px)_1fr]">
        <Card>
          <FormCardapio dataInicial={amanhaISO()} />
        </Card>
        <Card>
          <h2 className="mb-3 font-semibold">Publicados</h2>
          <ul className="space-y-3 text-sm">
            {cardapios.map((item) => (
              <li key={item.id} className="border-b border-zinc-100 pb-3">
                <p className="font-medium">
                  {formatarDataCurta(item.data)}
                  {item.data === hojeISO() ? " · hoje" : ""}
                  {item.data === amanhaISO() ? " · amanhã" : ""}
                </p>
                <p className="text-zinc-600">{item.descricao}</p>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </PageShell>
  );
}
