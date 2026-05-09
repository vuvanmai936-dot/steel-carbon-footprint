#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""将客户商务目录下的 Markdown 转为 DOCX（依赖 markdown + html2docx）。"""
import argparse
import re
import sys
from pathlib import Path
from typing import Optional

try:
    import markdown as md_lib
    from html2docx import html2docx as html_to_docx_buf
except ImportError:
    print("请执行: python3 -m venv .venv_docx && .venv_docx/bin/pip install markdown html2docx beautifulsoup4 lxml", file=sys.stderr)
    raise

ROOT = Path(__file__).resolve().parents[1]


def md_to_html(md_text: str) -> str:
    # Mermaid 块在 Word 中无法渲染，改为说明段落
    def replace_mermaid(m):
        return "\n\n**[图示]** 以下 Mermaid 图请查看同名 `.md` 源文件。\n\n"

    md_text = re.sub(
        r"^```mermaid\n.*?^```\n",
        replace_mermaid,
        md_text,
        flags=re.MULTILINE | re.DOTALL,
    )
    body = md_lib.markdown(
        md_text,
        extensions=[
            "tables",
            "fenced_code",
            "nl2br",
            "sane_lists",
        ],
        extension_configs={"markdown.extensions.nl2br": {}},
    )
    return (
        "<html><head><meta charset='utf-8'></head><body>"
        + body
        + "</body></html>"
    )


def convert(md_path: Path, docx_path: Optional[Path] = None) -> Path:
    md_path = md_path.resolve()
    if docx_path is None:
        docx_path = md_path.with_suffix(".docx")
    else:
        docx_path = docx_path.resolve()

    html = md_to_html(md_path.read_text(encoding="utf-8"))
    title = md_path.stem
    buf = html_to_docx_buf(html, title)
    docx_path.write_bytes(buf.getvalue())
    return docx_path


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument(
        "inputs",
        nargs="*",
        default=[
            str(ROOT / "产品建设方案总册.md"),
            str(ROOT / "附录_模块与文档映射表.md"),
        ],
        help="Markdown 文件路径，默认转换客户商务下总册与附录",
    )
    args = ap.parse_args()
    for p in args.inputs:
        out = convert(Path(p))
        print("Wrote", out)


if __name__ == "__main__":
    main()
