import { Card } from "@/components/ui";
import { FormPrimeiroAcesso } from "@/components/auth/forms";

export default function PrimeiroAcessoPage() {
  return (
    <main className="flex min-h-full items-center justify-center px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-semibold text-ifsc">Primeiro acesso</h1>
          <p className="mt-2 text-sm text-zinc-600">
            Use a matrícula e o e-mail institucional que já estão na lista do câmpus.
          </p>
        </div>
        <Card>
          <FormPrimeiroAcesso />
        </Card>
      </div>
    </main>
  );
}
