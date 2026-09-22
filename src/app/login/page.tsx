import { Card } from "@/components/ui";
import { FormLogin } from "@/components/auth/forms";

export default function LoginPage() {
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
          <FormLogin />
        </Card>
      </div>
    </main>
  );
}
