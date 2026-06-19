@echo off
cd /d "C:\Users\benjo\Documents\Codex\2026-06-07\codex-claude-code-cursor-devin-50\fifa-arbitrage"
start "NexusDevServer" cmd /c npx next.cmd dev --port 3005 > "C:\Users\benjo\Documents\Codex\2026-06-07\codex-claude-code-cursor-devin-50\fifa-arbitrage\server_bat_log.txt" 2>&1
exit 0
