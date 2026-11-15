"""
Servidor STT local para DocScribe (sin dependencias extra, usa faster-whisper).

Uso:  npm run stt     (o: <python del venv de whisperx> scripts/stt-server.py)

Variables opcionales:
  WHISPER_MODEL  tiny | base | small (default) | medium
  STT_PORT       8787
  STT_HOST       127.0.0.1
  FFMPEG_PATH    ruta a ffmpeg si no está en PATH

Audios largos: la respuesta se abre de inmediato y manda un espacio cada 10 s mientras transcribe
(JSON ignora espacios iniciales), así el cliente no corta por timeout de 5 min.
"""
import json
import os
import shutil
import subprocess
import tempfile
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

import numpy as np
from faster_whisper import WhisperModel

FFMPEG = os.environ.get("FFMPEG_PATH") or shutil.which("ffmpeg") or "ffmpeg"
MODEL_NAME = os.environ.get("WHISPER_MODEL", "small")
HOST = os.environ.get("STT_HOST", "127.0.0.1")
PORT = int(os.environ.get("STT_PORT", "8787"))
MAX_BYTES = 120 * 1024 * 1024


def decodificar(path: str) -> np.ndarray:
    """Audio (webm/opus, mp4, wav...) -> float32 mono 16 kHz con ffmpeg.
    Evita depender de la versión de PyAV que traiga faster-whisper."""
    r = subprocess.run(
        [FFMPEG, "-nostdin", "-v", "error", "-i", path, "-f", "f32le", "-ac", "1", "-ar", "16000", "-"],
        capture_output=True,
    )
    if r.returncode != 0:
        raise RuntimeError("ffmpeg: " + r.stderr.decode("utf-8", "ignore")[:300])
    return np.frombuffer(r.stdout, dtype=np.float32)


print(f"[stt] cargando modelo '{MODEL_NAME}' (CPU, int8)...", flush=True)
t0 = time.time()
model = WhisperModel(MODEL_NAME, device="cpu", compute_type="int8")
print(f"[stt] listo en {time.time() - t0:.1f}s -> http://{HOST}:{PORT}", flush=True)


def transcribir(data: bytes, ext: str) -> dict:
    with tempfile.NamedTemporaryFile(suffix=ext, delete=False) as f:
        f.write(data)
        path = f.name
    try:
        t = time.time()
        segments, info = model.transcribe(
            decodificar(path),
            language="es",
            beam_size=1,
            vad_filter=True,
            condition_on_previous_text=False,
        )
        text = " ".join(s.text.strip() for s in segments).strip()
        print(f"[stt] {info.duration:.0f}s de audio -> {time.time() - t:.1f}s, {len(text)} chars", flush=True)
        return {"text": text, "duration": info.duration}
    finally:
        try:
            os.unlink(path)
        except OSError:
            pass


class Handler(BaseHTTPRequestHandler):
    def _json(self, code, payload):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path == "/health":
            self._json(200, {"ok": True, "model": MODEL_NAME})
        else:
            self._json(404, {"error": "not found"})

    def do_POST(self):
        if self.path != "/transcribe":
            return self._json(404, {"error": "not found"})

        length = int(self.headers.get("Content-Length") or 0)
        if length <= 0 or length > MAX_BYTES:
            return self._json(400, {"error": "audio vacío o demasiado grande"})

        data = self.rfile.read(length)
        ctype = (self.headers.get("Content-Type") or "").lower()
        ext = ".m4a" if "mp4" in ctype else ".ogg" if "ogg" in ctype else ".webm"

        # Respuesta abierta de inmediato (sin Content-Length; termina al cerrar la conexión).
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Connection", "close")
        self.end_headers()
        self.close_connection = True

        resultado: dict = {}

        def trabajo():
            try:
                resultado.update(transcribir(data, ext))
            except Exception as e:  # noqa: BLE001
                print(f"[stt] error: {e}", flush=True)
                resultado["error"] = str(e)

        hilo = threading.Thread(target=trabajo, daemon=True)
        hilo.start()
        try:
            while hilo.is_alive():
                hilo.join(10)
                if hilo.is_alive():
                    self.wfile.write(b" ")
                    self.wfile.flush()
            self.wfile.write(json.dumps(resultado, ensure_ascii=False).encode("utf-8"))
        except (BrokenPipeError, ConnectionResetError):
            pass  # el cliente se fue; el resultado se descarta

    def log_message(self, *_args):
        pass


if __name__ == "__main__":
    ThreadingHTTPServer((HOST, PORT), Handler).serve_forever()
