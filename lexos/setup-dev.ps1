# LexOS Setup Script para Windows
# Automatiza la configuración inicial en desarrollo

param(
    [switch]$SkipEnv,
    [switch]$SkipDeps
)

$ErrorActionPreference = "Stop"
$PSDefaultParameterValues['Out-File:Encoding'] = 'UTF8'

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   LexOS -- Setup Development Environment  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ─── Verificar requisitos ─────────────────────────────────────────────────

Write-Host "[*] Verificando requisitos previos..." -ForegroundColor Yellow

function Test-Command {
    param([string]$Command)
    try { if (Get-Command $Command -ErrorAction Stop) { return $true } }
    catch { return $false }
}

function Test-PostgreSQL {
    $pgPaths = @(
        "C:\Program Files\PostgreSQL\18\bin\psql",
        "C:\Program Files\PostgreSQL\17\bin\psql",
        "C:\Program Files\PostgreSQL\16\bin\psql",
        "C:\Program Files\PostgreSQL\15\bin\psql",
        "C:\Program Files (x86)\PostgreSQL\18\bin\psql",
        "C:\Program Files (x86)\PostgreSQL\16\bin\psql"
    )
    foreach ($path in $pgPaths) {
        if (Test-Path $path) { return $true }
    }
    return $false
}

$checks = @{
    "Node.js (npm)" = { Test-Command "npm" }
    "PostgreSQL (psql)" = { Test-PostgreSQL }
    "Git" = { Test-Command "git" }
}

$allChecks = $true
foreach ($check in $checks.Keys) {
    $status = & $checks[$check]
    $icon = if ($status) { "[OK]" } else { "[FAIL]" }
    Write-Host "$icon $check"
    if (!$status) { $allChecks = $false }
}

if (!$allChecks) {
    Write-Host ""
    Write-Host "[ERROR] Faltan dependencias requeridas. Instalálalas desde:" -ForegroundColor Red
    Write-Host "   - Node.js: https://nodejs.org (v18+)" -ForegroundColor Red
    Write-Host "   - PostgreSQL: https://www.postgresql.org/download" -ForegroundColor Red
    Write-Host "   - Git: https://git-scm.com" -ForegroundColor Red
    exit 1
}

Write-Host "[OK] Todos los requisitos están instalados" -ForegroundColor Green
Write-Host ""

# ─── Crear archivo .env ───────────────────────────────────────────────────

if (!$SkipEnv) {
    Write-Host "[*] Configurando variables de entorno..." -ForegroundColor Yellow

    if (Test-Path ".env") {
        Write-Host "   [WARN] Archivo .env ya existe -- NO se sobrescribe" -ForegroundColor Magenta
    } else {
        if (!(Test-Path ".env.example")) {
            Write-Host "   [ERROR] Archivo .env.example no encontrado" -ForegroundColor Red
            exit 1
        }

        Copy-Item ".env.example" ".env"
        Write-Host "   [OK] Creado .env a partir de .env.example" -ForegroundColor Green

        # Generar AES_MASTER_KEY (24 caracteres aleatorios hex = 12 bytes, expandimos a 64)
        $randomKey = -join ((0..63) | ForEach-Object { [convert]::ToString((Get-Random -Maximum 16),16) })

        # Reemplazar en .env
        $envContent = Get-Content ".env" -Raw
        $envContent = $envContent -replace '(?m)^AES_MASTER_KEY=.*$', "AES_MASTER_KEY=$randomKey"
        Set-Content ".env" $envContent -Encoding UTF8

        Write-Host "   [OK] Generada AES_MASTER_KEY aleatoria" -ForegroundColor Green
        Write-Host ""
        Write-Host "   [!] IMPORTANTE: Edita .env y llena:" -ForegroundColor Magenta
        Write-Host "      - DATABASE_URL (credenciales PostgreSQL)" -ForegroundColor Magenta
        Write-Host "      - SUPABASE_URL, SUPABASE_SERVICE_KEY, SUPABASE_JWT_SECRET" -ForegroundColor Magenta
        Write-Host "      - OPENAI_API_KEY" -ForegroundColor Magenta
        Write-Host "      - PINECONE_API_KEY" -ForegroundColor Magenta
        Write-Host "      - VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY" -ForegroundColor Magenta
        Write-Host ""
        Write-Host "   [DOC] Abre: SETUP_LOCAL.md para instrucciones detalladas" -ForegroundColor Cyan
    }
}

# ─── Instalar dependencias ───────────────────────────────────────────────

if (!$SkipDeps) {
    Write-Host "[*] Instalando dependencias..." -ForegroundColor Yellow

    Write-Host "   -> Backend..."
    Push-Location "backend"
    try {
        npm install --silent
        Write-Host "      [OK] Backend dependencies OK" -ForegroundColor Green
    } catch {
        Write-Host "      [ERROR] Error en npm install (backend)" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    Pop-Location

    Write-Host "   -> Frontend..."
    Push-Location "frontend"
    try {
        npm install --silent
        Write-Host "      [OK] Frontend dependencies OK" -ForegroundColor Green
    } catch {
        Write-Host "      [ERROR] Error en npm install (frontend)" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    Pop-Location
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  [OK] Setup completado exitosamente" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[NEXT] Proximos pasos:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1) Edita .env con tus credenciales (Supabase, OpenAI, Pinecone)" -ForegroundColor White
Write-Host ""
Write-Host "2) Verifica que PostgreSQL esta corriendo:" -ForegroundColor White
Write-Host "   psql -U postgres -c 'SELECT 1'" -ForegroundColor Gray
Write-Host ""
Write-Host "3) Ejecuta las migraciones:" -ForegroundColor White
Write-Host "   cd backend; npm run db:migrate" -ForegroundColor Gray
Write-Host ""
Write-Host "4) Abre 2 terminales e inicia servers:" -ForegroundColor White
Write-Host "   Terminal 1: cd backend; npm run dev" -ForegroundColor Gray
Write-Host "   Terminal 2: cd frontend; npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "5) Accede a http://localhost:5173" -ForegroundColor White
Write-Host ""

Write-Host "[DOC] Documentacion: SETUP_LOCAL.md" -ForegroundColor Cyan
Write-Host "[HELP] Problemas: lee la seccion Troubleshooting en SETUP_LOCAL.md" -ForegroundColor Cyan
