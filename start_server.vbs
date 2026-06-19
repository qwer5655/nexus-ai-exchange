Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "C:\Users\benjo\Documents\Codex\2026-06-07\codex-claude-code-cursor-devin-50\fifa-arbitrage"
WshShell.Run "cmd /c npm run dev > server_log.txt 2>&1", 0, False
