import type { ButtonHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes } from "react";

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm ${className}`}>
      {children}
    </section>
  );
}

export function Botao({
  children,
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
}) {
  const estilos = {
    primary: "bg-ifsc text-white hover:bg-ifsc-dark",
    secondary: "border border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50",
    danger: "bg-red-700 text-white hover:bg-red-800",
    ghost: "text-ifsc hover:bg-ifsc-soft",
  };
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${estilos[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Campo({
  label,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-zinc-700">{label}</span>
      <input
        className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none ring-ifsc focus:ring-2"
        {...props}
      />
    </label>
  );
}

export function AreaTexto({
  label,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-zinc-700">{label}</span>
      <textarea
        className="min-h-24 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none ring-ifsc focus:ring-2"
        {...props}
      />
    </label>
  );
}

export function Aviso({
  children,
  tipo = "erro",
}: {
  children: React.ReactNode;
  tipo?: "erro" | "ok";
}) {
  const classe =
    tipo === "ok"
      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
      : "border-red-200 bg-red-50 text-red-800";
  return (
    <p className={`rounded-xl border px-3 py-2 text-sm ${classe}`} role="status">
      {children}
    </p>
  );
}

export function PageShell({
  titulo,
  descricao,
  children,
}: {
  titulo: string;
  descricao?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-ifsc">{titulo}</h1>
        {descricao ? <p className="mt-1 text-sm text-zinc-600">{descricao}</p> : null}
      </header>
      {children}
    </div>
  );
}
