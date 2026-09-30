import { Card } from "@/components/ui";
import { FormLogin } from "@/components/auth/forms";

const AVISOS: Record<string, string> = {
  "google-indisponivel":
    "O login com Google ainda não foi configurado. Use e-mail e senha, ou peça para a administração concluir a configuração.",
  "google-negado": "O login com Google foi cancelado.",
  "google-dominio": "Entre com a conta Google @ifsc.edu.br ou @aluno.ifsc.edu.br.",
  "google-falhou": "Não foi possível entrar com o Google. Tente de novo.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const { erro } = await searchParams;
  const aviso = erro ? AVISOS[erro] : undefined;

  return (
    <main className="flex min-h-full items-center justify-center px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-ifsc">
            IFSC
          </p>
          <h1 className="mt-1 text-3xl font-semibold text-ifsc">Cantina</h1>
          <p className="mt-2 text-sm text-zinc-600">
            Quando houver cardápio de amanhã, reserve até as 22h.
          </p>
        </div>
        <Card>
          <FormLogin aviso={aviso} />
        </Card>
      </div>
    </main>
  );
}
