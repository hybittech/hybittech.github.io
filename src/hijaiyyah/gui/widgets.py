"""Reusable GUI widgets for the HOM application."""

from __future__ import annotations

import tkinter as tk
from tkinter import ttk
from typing import Any, Dict, Optional, Tuple

from .theme import THEME


class OutputWriter:
    """Wraps a tk.Text widget with a simple write/clear interface."""

    def __init__(self, widget: tk.Text) -> None:
        self._w = widget

    def clear(self) -> None:
        self._w.config(state=tk.NORMAL)
        self._w.delete("1.0", tk.END)
        self._w.config(state=tk.DISABLED)

    def write(self, text: str, tag: str = "") -> None:
        self._w.config(state=tk.NORMAL)
        if tag:
            self._w.insert(tk.END, text, tag)
        else:
            self._w.insert(tk.END, text)
        self._w.see(tk.END)
        self._w.config(state=tk.DISABLED)

    def writeln(self, text: str = "", tag: str = "") -> None:
        self.write(text + "\n", tag)

    def set_text(self, text: str) -> None:
        self._w.config(state=tk.NORMAL)
        self._w.delete("1.0", tk.END)
        self._w.insert("1.0", text)
        self._w.config(state=tk.DISABLED)

    def add_tags(self, tags: Dict[str, Dict[str, Any]]) -> None:
        for name, config in tags.items():
            self._w.tag_configure(name, **config)


def make_text(
    parent: tk.Widget,
    *,
    font: Tuple = THEME.font_mono,
    bg: str = THEME.text_bg,
    fg: str = THEME.fg,
    wrap: str = "word",
    readonly: bool = True,
    scrollbar: bool = True,
) -> Tuple[tk.Text, Optional[ttk.Scrollbar]]:
    """Factory for creating styled Text widgets with optional scrollbar."""
    text = tk.Text(
        parent,
        font=font,
        bg=bg,
        fg=fg,
        wrap=wrap,  # type: ignore[arg-type]
        insertbackground=fg,
        undo=True,
    )
    if readonly:
        text.config(state=tk.DISABLED)

    sb: Optional[ttk.Scrollbar] = None
    if scrollbar:
        sb = ttk.Scrollbar(parent, command=text.yview)
        text.configure(yscrollcommand=sb.set)
        sb.pack(side=tk.RIGHT, fill=tk.Y)

    text.pack(fill=tk.BOTH, expand=True)
    return text, sb
