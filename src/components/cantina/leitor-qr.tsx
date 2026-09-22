"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { confirmarPorQrAction, type EstadoCantina } from "@/actions/cantina";
import { lerQrDoArquivo, lerQrDoCanvas } from "@/components/cantina/decodificar-qr";
import { Aviso, Botao } from "@/components/ui";

export function LeitorQr() {
  const [resultado, setResultado] = useState<EstadoCantina>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [cameraAtiva, setCameraAtiva] = useState(false);
  const [pending, startTransition] = useTransition();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const arquivoRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<number>(0);
  const lendo = useRef(false);

  function pararCamera() {
    cancelAnimationFrame(frameRef.current);
    streamRef.current?.getTracks().forEach((faixa) => faixa.stop());
    streamRef.current = null;
    const video = videoRef.current;
    if (video) video.srcObject = null;
    setCameraAtiva(false);
  }

  function validar(texto: string) {
    if (lendo.current) return;
    lendo.current = true;
    pararCamera();
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(80);
    }
    startTransition(async () => {
      const resposta = await confirmarPorQrAction(texto);
      setResultado(resposta);
      lendo.current = false;
    });
  }

  function varrerFrame() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) {
      frameRef.current = requestAnimationFrame(varrerFrame);
      return;
    }
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const texto = lerQrDoCanvas(canvas);
      if (texto) {
        validar(texto);
        return;
      }
    }
    frameRef.current = requestAnimationFrame(varrerFrame);
  }

  async function iniciarCamera() {
    setAviso(null);
    setResultado(null);
    pararCamera();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      await video.play();
      setCameraAtiva(true);
      frameRef.current = requestAnimationFrame(varrerFrame);
    } catch {
      setAviso(
        "O celular bloqueia a câmera em HTTP. Use https://172.16.110.6 (aceite o aviso do certificado) para leitura automática, ou tire uma foto do QR.",
      );
    }
  }

  async function lerArquivo(file: File | undefined) {
    if (!file) return;
    setAviso(null);
    setResultado(null);
    pararCamera();
    const texto = await lerQrDoArquivo(file);
    if (texto) {
      validar(texto);
      return;
    }
    setAviso("Não deu para ler o QR nesta imagem. Enquadre só o código, sem o resto da tela, e tente de novo.");
  }

  useEffect(() => {
    void iniciarCamera();
    return () => pararCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-2xl bg-zinc-900">
        <video
          ref={videoRef}
          className={`w-full bg-black object-cover ${cameraAtiva ? "aspect-[3/4]" : "hidden"}`}
          playsInline
          muted
          autoPlay
        />
        {cameraAtiva ? (
          <p className="absolute inset-x-0 bottom-0 bg-black/50 px-3 py-2 text-center text-xs text-white">
            Aponte para o QR. A leitura é automática.
          </p>
        ) : (
          <div className="flex aspect-[3/4] items-center justify-center px-6 text-center text-sm text-white/80">
            {aviso
              ? "Câmera ao vivo indisponível aqui. Tire uma foto só do QR ou abra o endereço em HTTPS."
              : "Abrindo a câmera para leitura automática…"}
          </div>
        )}
      </div>
      <canvas ref={canvasRef} className="hidden" />

      <input
        ref={arquivoRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={(e) => {
          void lerArquivo(e.target.files?.[0]);
          e.target.value = "";
        }}
      />

      <div className="flex flex-col gap-2 sm:flex-row">
        {!cameraAtiva ? (
          <Botao type="button" className="w-full" onClick={() => void iniciarCamera()}>
            Ligar câmera
          </Botao>
        ) : (
          <Botao type="button" variant="secondary" className="w-full" onClick={pararCamera}>
            Parar câmera
          </Botao>
        )}
        <Botao type="button" variant="secondary" className="w-full" onClick={() => arquivoRef.current?.click()}>
          Tirar foto do QR
        </Botao>
      </div>

      {pending ? <p className="text-sm text-zinc-600">Validando QR...</p> : null}
      {aviso ? <Aviso>{aviso}</Aviso> : null}
      {resultado?.erro ? <Aviso>{resultado.erro}</Aviso> : null}
      {resultado?.ok ? (
        <>
          <Aviso tipo="ok">
            {resultado.mensagem} {resultado.nome} ({resultado.matricula})
          </Aviso>
          <Botao
            type="button"
            className="w-full"
            onClick={() => {
              setResultado(null);
              void iniciarCamera();
            }}
          >
            Ler outro QR
          </Botao>
        </>
      ) : null}
    </div>
  );
}
