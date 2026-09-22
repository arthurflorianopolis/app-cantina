import jsQR from "jsqr";

function ler(image: ImageData) {
  const achado = jsQR(image.data, image.width, image.height, {
    inversionAttempts: "attemptBoth",
  });
  const texto = achado?.data?.trim();
  return texto || null;
}

function desenhar(
  origem: CanvasImageSource,
  largura: number,
  altura: number,
  sx: number,
  sy: number,
  sw: number,
  sh: number,
  limiar?: number,
) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(largura));
  canvas.height = Math.max(1, Math.round(altura));
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(origem, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
  const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
  if (limiar !== undefined) {
    const d = image.data;
    for (let i = 0; i < d.length; i += 4) {
      const g = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      const v = g < limiar ? 0 : 255;
      d[i] = d[i + 1] = d[i + 2] = v;
    }
  }
  return ler(image);
}

export function lerQrDoCanvas(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx || canvas.width < 20 || canvas.height < 20) return null;
  return ler(ctx.getImageData(0, 0, canvas.width, canvas.height));
}

export async function lerQrDoArquivo(arquivo: Blob) {
  const bitmap = await createImageBitmap(arquivo);
  const { width: w, height: h } = bitmap;
  const cortes = [
    [0, 0, w, h],
    [w * 0.1, h * 0.1, w * 0.8, h * 0.8],
    [w * 0.15, h * 0.05, w * 0.7, h * 0.9],
  ] as const;
  const larguras = [900, 640, 1200, 400];
  const limiares = [undefined, 120, 160, 90];

  for (const [sx, sy, sw, sh] of cortes) {
    for (const alvo of larguras) {
      const escala = alvo / sw;
      const lh = sh * escala;
      for (const limiar of limiares) {
        const texto = desenhar(bitmap, alvo, lh, sx, sy, sw, sh, limiar);
        if (texto) {
          bitmap.close();
          return texto;
        }
      }
    }
  }
  bitmap.close();
  return null;
}
