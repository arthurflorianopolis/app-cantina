"use client";

import { useActionState } from "react";
import {
  cancelarReservaAction,
  reservarHojeAction,
  type EstadoReserva,
} from "@/actions/reserva";
import { Aviso, Botao } from "@/components/ui";

export function FormReservar({ data }: { data: string }) {
  async function reservarWrapper(
    _prev: EstadoReserva,
    _formData: FormData,
  ): Promise<EstadoReserva> {
    return reservarHojeAction(data);
  }
  const [estado, action, pending] = useActionState(reservarWrapper, null as EstadoReserva);
  return (
    <form action={action} className="space-y-3">
      {estado && "erro" in estado ? <Aviso>{estado.erro}</Aviso> : null}
      <Botao type="submit" className="w-full" disabled={pending}>
        {pending ? "Reservando..." : "Reservar e gerar QR"}
      </Botao>
    </form>
  );
}

export function FormCancelar({ data }: { data: string }) {
  async function cancelarWrapper(
    _prev: EstadoReserva,
    _formData: FormData,
  ): Promise<EstadoReserva> {
    return cancelarReservaAction(data);
  }
  const [estado, action, pending] = useActionState(cancelarWrapper, null as EstadoReserva);
  return (
    <form action={action} className="space-y-3">
      {estado && "erro" in estado ? <Aviso>{estado.erro}</Aviso> : null}
      <Botao type="submit" variant="danger" className="w-full" disabled={pending}>
        {pending ? "Cancelando..." : "Cancelar reserva"}
      </Botao>
    </form>
  );
}
