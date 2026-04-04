#!/usr/bin/env python3
"""Claude Code PostToolUse hook: registra cada git commit exitoso en DAILY.md."""

import json
import re
import subprocess
import sys
from datetime import datetime
from pathlib import Path


def main():
    payload = json.loads(sys.stdin.read())

    if payload.get("tool_name") != "Bash":
        return

    command = payload.get("tool_input", {}).get("command", "")

    # Solo actuar en git commit (no en nuestros propios commits de daily)
    if "git commit" not in command or "daily:" in command:
        return

    # Verificar que el commit fue exitoso (output contiene "[branch hash]")
    output = str(payload.get("tool_output", ""))
    if not re.search(r"\[\S+\s+\w+\]", output):
        return

    try:
        msg = subprocess.check_output(
            ["git", "log", "-1", "--format=%s"], text=True
        ).strip()

        # Ignorar si el ultimo commit es un daily
        if msg.startswith("daily:"):
            return

        author = subprocess.check_output(
            ["git", "config", "user.name"], text=True
        ).strip()

        commit_hash = subprocess.check_output(
            ["git", "log", "-1", "--format=%h"], text=True
        ).strip()

        files = subprocess.check_output(
            ["git", "diff-tree", "--no-commit-id", "--name-only", "-r", "HEAD"],
            text=True,
        ).strip()
    except subprocess.CalledProcessError:
        return

    today = datetime.now().strftime("%Y-%m-%d")
    time_now = datetime.now().strftime("%H:%M")

    daily_path = Path("DAILY.md")
    content = daily_path.read_text() if daily_path.exists() else "# Daily Log\n"

    # Construir entrada
    file_lines = "\n".join(f"  - `{f}`" for f in files.splitlines() if f)
    entry = f"- **{time_now}** `{commit_hash}` — {msg}\n{file_lines}\n"

    date_header = f"## {today}"
    author_header = f"### {author}"

    if date_header in content:
        if author_header in content:
            # Agregar entrada despues del header del autor
            content = content.replace(
                author_header + "\n", author_header + "\n" + entry + "\n", 1
            )
        else:
            # Agregar seccion del autor despues del header de fecha
            content = content.replace(
                date_header + "\n",
                date_header + "\n\n" + author_header + "\n" + entry + "\n",
                1,
            )
    else:
        # Nueva fecha al principio (despues del titulo)
        content = content.replace(
            "# Daily Log\n",
            "# Daily Log\n\n" + date_header + "\n\n" + author_header + "\n" + entry + "\n",
            1,
        )

    daily_path.write_text(content)

    # Commitear solo si hay cambios staged
    subprocess.run(["git", "add", "DAILY.md"], check=True)
    diff = subprocess.run(["git", "diff", "--cached", "--quiet"], capture_output=True)
    if diff.returncode != 0:
        subprocess.run(
            ["git", "commit", "--no-verify", "-m", f"daily: {today}"],
            check=True,
            capture_output=True,
        )


if __name__ == "__main__":
    main()
