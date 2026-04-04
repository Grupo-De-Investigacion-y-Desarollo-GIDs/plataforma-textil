#!/usr/bin/env python3
"""Claude Code PostToolUse hook: registra cada git commit exitoso en DAILY.md.

Estrategia robusta: no parsea tool_output. Cuando detecta 'git commit' en el
comando, consulta git directamente y compara HEAD contra el ultimo commit
logueado (guardado en .last_daily_commit). Si HEAD cambio y no es un commit
'daily:', registra la entrada.
"""

import json
import subprocess
import sys
from datetime import datetime
from pathlib import Path

# Paths relativos al root del proyecto (el script esta en .claude/hooks/)
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
LAST_COMMIT_FILE = PROJECT_ROOT / ".claude" / "hooks" / ".last_daily_commit"
LOG_FILE = PROJECT_ROOT / ".claude" / "hooks" / "daily_hook.log"
DAILY_PATH = PROJECT_ROOT / "DAILY.md"


def log(msg: str):
    try:
        with LOG_FILE.open("a") as f:
            f.write(f"[{datetime.now().isoformat()}] {msg}\n")
    except Exception:
        pass


def git(*args: str) -> str:
    return subprocess.check_output(
        ["git", *args], text=True, cwd=str(PROJECT_ROOT)
    ).strip()


def main():
    try:
        payload = json.loads(sys.stdin.read())
    except Exception as e:
        log(f"stdin parse error: {e}")
        return

    if payload.get("tool_name") != "Bash":
        return

    command = payload.get("tool_input", {}).get("command", "")
    if "git commit" not in command:
        return

    log(f"git commit detected")

    # Consultar git directamente — no depender de tool_output
    try:
        head_hash = git("log", "-1", "--format=%H")
        msg = git("log", "-1", "--format=%s")
    except subprocess.CalledProcessError as e:
        log(f"git log failed: {e}")
        return

    # Ignorar commits daily (son del propio hook)
    if msg.startswith("daily:"):
        log(f"skip daily commit: {msg}")
        return

    # Comparar contra el ultimo commit logueado
    last_logged = ""
    if LAST_COMMIT_FILE.exists():
        last_logged = LAST_COMMIT_FILE.read_text().strip()

    if head_hash == last_logged:
        log(f"already logged or commit failed: {head_hash[:8]}")
        return

    log(f"new commit: {head_hash[:8]} — {msg}")

    # Obtener detalles del commit
    try:
        author = git("config", "user.name")
        short_hash = git("log", "-1", "--format=%h")
        files = git("diff-tree", "--no-commit-id", "--name-only", "-r", "HEAD")
    except subprocess.CalledProcessError as e:
        log(f"git details failed: {e}")
        return

    today = datetime.now().strftime("%Y-%m-%d")
    time_now = datetime.now().strftime("%H:%M")

    # Leer o crear DAILY.md
    if DAILY_PATH.exists():
        content = DAILY_PATH.read_text()
        if "# Daily Log" not in content:
            content = "# Daily Log\n"
    else:
        content = "# Daily Log\n"

    # Construir entrada
    file_lines = "\n".join(f"  - `{f}`" for f in files.splitlines() if f)
    entry = f"- **{time_now}** `{short_hash}` — {msg}\n{file_lines}\n"

    date_header = f"## {today}"
    author_header = f"### {author}"

    if date_header in content:
        if author_header in content:
            content = content.replace(
                author_header + "\n", author_header + "\n" + entry + "\n", 1
            )
        else:
            content = content.replace(
                date_header + "\n",
                date_header + "\n\n" + author_header + "\n" + entry + "\n",
                1,
            )
    else:
        content = content.replace(
            "# Daily Log\n",
            "# Daily Log\n\n"
            + date_header
            + "\n\n"
            + author_header
            + "\n"
            + entry
            + "\n",
            1,
        )

    DAILY_PATH.write_text(content)

    # Commitear el DAILY.md
    subprocess.run(
        ["git", "add", "DAILY.md"], check=True, cwd=str(PROJECT_ROOT)
    )
    diff = subprocess.run(
        ["git", "diff", "--cached", "--quiet"],
        capture_output=True,
        cwd=str(PROJECT_ROOT),
    )
    if diff.returncode != 0:
        subprocess.run(
            ["git", "commit", "--no-verify", "-m", f"daily: {today}"],
            check=True,
            capture_output=True,
            cwd=str(PROJECT_ROOT),
        )

    # Guardar hash del commit logueado (el original, no el daily)
    LAST_COMMIT_FILE.write_text(head_hash)
    log(f"logged OK: {short_hash} — {msg}")


if __name__ == "__main__":
    main()
