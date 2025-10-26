#!/bin/bash

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     Black Swan Terminal - Demo Mode Launcher              ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "[1/3] Generating demo alerts..."
node scripts/generate-demo-alerts.js 30
echo ""
echo "[2/3] Starting LUMI server..."
echo ""
echo "[3/3] Open your browser to:"
echo "      http://localhost:3000/black-swan-terminal"
echo ""
npm run dev








