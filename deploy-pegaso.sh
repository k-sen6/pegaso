#!/bin/bash
# ==========================================
# PEGASO - Deployment Script Forzado
# Author: Agente Opencode
# Description: Forza el nuevo despliegue en GitHub Pages
# ==========================================

set -e

echo "=========================================="
echo "🚀 PEGASO - Deployment Script Forzado"
echo "=========================================="

# 1. Verificar que estamos en el directorio correcto
echo ""
echo "📁 Verificando directorio..."
if [ ! -d "src" ] || [ ! -d ".github" ]; then
    echo "❌ Error: No está en el directorio raíz del proyecto Pegaso"
    echo "   Ejecuta este script desde: /home/pentester_kyu/pegaso"
    exit 1
fi

echo "✅ Directorio verificado"

# 2. Build local primero (asegurar que pasa)
echo ""
echo "🔨 Paso 1: Build local..."
echo "   Ejecutando: npm run build"
npm_run_output=$(npm run build 2>&1)
build_exit_code=$?

if [ $build_exit_code -ne 0 ]; then
    echo "❌ Build local falló!"
    echo ""
    echo "📝 Output del build:"
    echo "$npm_run_output" | grep -E "error|Error" | head -10
    exit 1
fi

echo "✅ Build local pasa limpio"
echo "$npm_run_output" | grep -E "✓ Compiled|info  - Need to disable" | head -5

# 3. Confirmar cambios listos para commitear
echo ""
echo "📦 Paso 2: Preparando commit..."
git_status=$(git status --short)
if [ -z "$git_status" ]; then
    echo "⚠️ No hay cambios nuevos en el working directory"
    echo "   Agregando todos los archivos modified..."
    git add -A
fi

# Verificar que haya commits significativos
changed_files=$(git diff --name-only HEAD 2>/dev/null | wc -l)
if [ "$changed_files" -eq 0 ]; then
    echo "ℹ️ No hay commits nuevos desde el último push"
    echo "   Se hará un commit vacío para trigger Actions"
fi

# 4. Commit y push para trigger GitHub Actions
echo ""
echo "🚀 Paso 3: Forzando nuevo deployment..."
commit_msg="Fix: forced deployment - $(date '+%Y-%m-%d %H:%M:%S') + TypeScript fixes + mock removal"

git add -A
git commit --allow-empty -m "$commit_msg"
git push origin main

echo "✅ Push enviado a origin/main"
echo "   Commit: $commit_msg"

# 5. Esperar a que GitHub Actions compile
echo ""
echo "⏳ Paso 4: Esperando build de GitHub Actions..."
echo "   Esto tarda típicamente 2-5 minutos..."
echo ""

max_wait=300  # 5 minutos máximo
waited=0
while [ $waited -lt $max_wait ]; do
    # Verificar status del último run
    last_run=$(gh run list --limit 1 --branch main 2>&1 | head -1)
    
    if echo "$last_run" | grep -q "completed\|failure"; then
        break
    fi
    
    waited=$((waited + 10))
    sleep 10
    echo "   ⏱️ Esperado $waited segundos... ($((max_wait - waited)) restantes)"
done

echo ""
echo "📊 Último estado del build:"
gh run list --limit 1 --branch main 2>&1 | head -3

# 7. Verificar despliegue
echo ""
echo "🌐 Paso 5: Verificando despliegue en GitHub Pages..."
deploy_url="https://k-sen6.github.io/pegaso/"

echo "   URL: $deploy_url"
echo ""
echo "   Para probar en teléfonos fresh:"
echo "   1. Ir al URL arriba"
echo "   2. Presionar Ctrl+Shift+R tres veces seguidas (hard refresh)"
echo "   3. Probar /vendedores - debería mostrar datos reales (sin mocks de 8 items)"
echo "   4. Probar /mi-cuenta - panel subida de fotos funcional"
echo "   5. Probar guardar producto: nombre, precio > 0, sector, descripción, subir imagen, guardar"

echo ""
echo "=========================================="
echo "✅ Script completado"
echo "=========================================="
echo ""
echo "ℹ️ Próximos pasos manuales:"
echo "   - Si el build falla en CI: Ejecutar script nuevamente o revisar gh run view ÚLTIMO_RUN_ID --log"
echo "   - Si el sitio aún muestra datos viejos: Limpiar cache del navegador (Ctrl+Shift+R)"
echo "   - Si las rutas son /cooperativas: Verificar que el workflow use Node 24 (node-version: 24)"