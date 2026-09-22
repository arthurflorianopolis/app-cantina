import QRCode from "qrcode";

export async function gerarQrDataUrl(valor: string) {
  return QRCode.toDataURL(valor, {
    width: 560,
    margin: 2,
    errorCorrectionLevel: "H",
    color: { dark: "#08442c", light: "#ffffff" },
  });
}
