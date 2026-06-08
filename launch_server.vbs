Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "C:\\Users\\benjo\\Documents\\Codex\\2026-06-07\\codex-claude-code-cursor-devin-50\\fifa-arbitrage"
WshShell.Run "cmd /c cd /d C:\\Users\\benjo\\Documents\\Codex\\2026-06-07\\codex-claude-code-cursor-devin-50\\fifa-arbitrage && npm run dev > C:\\Users\\benjo\\Documents\\Codex\\2026-06-07\\codex-claude-code-cursor-devin-50\\fifa-arbitrage\\server_vbs_log.txt 2>&1", 0, False
WScript.Quit 0