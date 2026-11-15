// Lanza el servidor STT con el python del venv de whisperx (evita problemas de comillas/espacios en npm).
import { spawn } from "node:child_process";
import os from "node:os";
import path from "node:path";

const py = path.join(os.homedir(), "AppData", "Roaming", "uv", "tools", "whisperx", "Scripts", "python.exe");
spawn(py, ["scripts/stt-server.py"], { stdio: "inherit" }).on("exit", (c) => process.exit(c ?? 1));
