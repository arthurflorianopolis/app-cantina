import { Card } from "@/components/ui";
import { FormEsqueciSenha } from "@/components/auth/forms";

export default function EsqueciSenhaPage() {
  return (
    <main className="flex min-h-full items-center justify-center px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-semibold text-ifsc">Esqueceu a senha</h1>
          <p className="mt-2 text-sm text-zinc-600">
            Informe matrícula e e-mail. Enviamos uma senha temporária e, no próximo
            login, você cria uma senha nova.
          </p>
        </div>
        <Card>
          <FormEsqueciSenha />
        </Card>
      </div>
    </main>
  );
}
