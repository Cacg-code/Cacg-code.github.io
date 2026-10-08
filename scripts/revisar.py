#!/usr/bin/env python3
"""Revisión del portafolio (solo biblioteca estándar): enlaces locales, metadatos, Open Graph y sitemap.
Uso: python scripts/revisar.py"""
import re, sys
from pathlib import Path
RAIZ = Path(__file__).resolve().parent.parent
sys.stdout.reconfigure(encoding="utf-8")
errores = []
paginas = sorted(p for p in RAIZ.rglob("*.html") if p.name == "index.html" and ".git" not in p.parts and "node_modules" not in p.parts)

def limpio(h):
    h = re.sub(r"<!--.*?-->", "", h, flags=re.S)
    return re.sub(r"<(pre|code|textarea|script|style)\b.*?</\1>", "", h, flags=re.S | re.I)

sitemap = (RAIZ / "sitemap.xml").read_text(encoding="utf8")
for p in paginas:
    rel = p.relative_to(RAIZ).as_posix()
    crudo = p.read_text(encoding="utf8"); h = limpio(crudo)
    if 'lang="es"' not in crudo: errores.append(f"{rel}: falta lang=\"es\"")
    if "<title>" not in crudo: errores.append(f"{rel}: falta <title>")
    if 'name="description"' not in crudo: errores.append(f"{rel}: falta meta description")
    if "og:image" not in crudo: errores.append(f"{rel}: falta og:image")
    for m in re.finditer(r'<[a-z][^<>]*?\s(?:href|src)="([^"]+)"', h):
        u = m.group(1)
        if re.match(r"^(https?:|//|mailto:|tel:|data:|javascript:|#)", u) or u.startswith("/"): continue
        d = (p.parent / u.split("#")[0].split("?")[0]).resolve()
        if d.is_dir(): d = d / "index.html"
        if not d.exists(): errores.append(f"{rel}: enlace roto → {u}")
    ruta = rel[:-len("index.html")] if rel.endswith("index.html") else rel
    if f"cacg-code.github.io/{ruta}</loc>" not in sitemap: errores.append(f"sitemap.xml: falta {ruta or '/'}")
if errores:
    print(f"✗ {len(errores)} problema(s):"); [print("  -", e) for e in errores]; sys.exit(1)
print(f"✓ {len(paginas)} páginas revisadas, sin problemas")
