export function QrComprovante({
  imagem,
  nome,
  data,
  prato,
}: {
  imagem: string;
  nome: string;
  data: string;
  prato: string;
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-6">
      <img
        src={imagem}
        alt="QR Code da reserva"
        width={220}
        height={220}
        className="h-56 w-56 bg-white"
      />
      <div className="text-center">
        <p className="font-semibold text-zinc-900">{nome}</p>
        <p className="text-sm capitalize text-zinc-600">{data}</p>
        <p className="mt-2 text-sm text-zinc-700">{prato}</p>
      </div>
      <p className="max-w-xs text-center text-xs text-zinc-500">
        Mostre este QR na cantina. Ele vale só para esta refeição e deixa de funcionar depois de usado.
      </p>
    </div>
  );
}
