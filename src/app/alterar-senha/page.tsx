import { Card } from "@/components/ui";
import { FormAlterarSenha } from "@/components/auth/forms";
import { logoutAction } from "@/actions/auth";

export default function AlterarSenhaPage() {
  return (
    <main className="flex min-h-full items-center justify-center px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-semibold text-ifsc">Crie sua senha</h1>
          <p className="mt-2 text-sm text-zinc-600">
            Use no mínimo 6 caracteres. Não use o número da matrícula.
          </p>
        </div>
        <Card>
          <FormAlterarSenha />
        </Card>
        <form action={logoutAction} className="text-center">
          <button type="submit" className="text-sm font-semibold text-ifsc">
            Sair
          </button>
        </form>
      </div>
    </main>
  );
}
