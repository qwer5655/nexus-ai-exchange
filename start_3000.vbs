Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "C:\Users\benjo\Documents\Codex\2026-06-07\codex-claude-code-cursor-devin-50\fifa-arbitrage"
WshShell.Run "cmd /c cd /d C:\Users\benjo\Documents\Codex\2026-06-07\codex-claude-code-cursor-devin-50\fifa-arbitrage && npm.cmd run start -- -p 3000", 0, False
WScript.Quit 0
