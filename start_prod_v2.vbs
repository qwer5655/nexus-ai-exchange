Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "C:\\Users\\benjo\\Documents\\Codex\\2026-06-07\\codex-claude-code-cursor-devin-50\\fifa-arbitrage"
WshShell.Run "node_modules\next\dist\bin\next start -p 4200", 0, False
WScript.Quit 0
