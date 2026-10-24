#!/usr/bin/env python3
"""Build an offline, source-faithful 2023–2026 paper library from the verified LFS archive.

Does not infer unknown chemicals or claim a question has an interactive simulation.
Original page images preserve tables, formulae, and answer spaces without OCR rewriting.
"""
import concurrent.futures
import hashlib
import json
import pathlib
import re
import sys
import zipfile

ROOT = pathlib.Path(__file__).resolve().parents[1]
ARCHIVE = ROOT / 'dropbox_downloads/Chemistry_Qualitative_Practicals_2001-2026.zip'
EXPECTED = '4b2e3266cc666b68ee1aa092fb07ea7edd68b72c5d3b0a45f92e35251dab678c'
OUTPUT = ROOT / 'public/past-papers'


def digest(data):
    return hashlib.sha256(data).hexdigest()


def prepare(row):
    import fitz
    from PIL import Image
    # Each worker opens its own ZIP handle; no shared seek cursor.
    with zipfile.ZipFile(ARCHIVE) as archive:
        directory = OUTPUT / row['id']
        directory.mkdir(parents=True, exist_ok=True)
        assets = {}
        total = None
        for kind, source in [('question', row['qp_extract']), ('markScheme', row['ms_extract'])] + [
            (f'materials{i + 1}', path) for i, path in enumerate(row['ci_extracts'])
        ]:
            data = archive.read(source)
            if not data.startswith(b'%PDF-'):
                raise ValueError(f'{source}: not a PDF')
            pdf = fitz.open(stream=data, filetype='pdf')
            if not len(pdf):
                raise ValueError(f'{source}: no pages')
            filename = kind + '.pdf'
            (directory / filename).write_bytes(data)
            pages = []
            for i, page in enumerate(pdf):
                name = f'{kind}-{i + 1}.webp'
                image_path = directory / name
                if not image_path.exists():
                    pix = page.get_pixmap(matrix=fitz.Matrix(1440 / page.rect.width, 1440 / page.rect.width), alpha=False)
                    image = Image.frombytes('RGB', (pix.width, pix.height), pix.samples)
                    image.save(image_path, 'WEBP', quality=90, method=4)
                pages.append({'path': f'past-papers/{row["id"]}/{name}', 'width': 1440,
                              'height': round(1440 * page.rect.height / page.rect.width)})
            assets[kind] = {'pdf': f'past-papers/{row["id"]}/{filename}', 'sha256': digest(data), 'pages': pages}
            if kind == 'question':
                text = '\n'.join(page.get_text() for page in pdf)
                totals = re.findall(r'\[\s*Total\s*:\s*(\d+)\s*\]', text, re.I)
                if len(set(totals)) != 1:
                    raise ValueError(f'{row["id"]}: cannot verify total marks: {totals}')
                total = int(totals[0])
            pdf.close()
        return {**{k: row[k] for k in ['id', 'code', 'year', 'session', 'paper', 'question', 'source_urls', 'qp_pages', 'ms_pages', 'source_note']},
                'totalMarks': total, 'assets': assets, 'archiveSha256': EXPECTED}


def main():
    if '--check' in sys.argv:
        data_file = ROOT / 'src/papers/archive-data.ts'
        data = json.loads(data_file.read_text().split(' = ', 1)[1].removesuffix(' as const\n'))
        checked = 0
        for row in data:
            for asset in row['assets'].values():
                path = ROOT / 'public' / asset['pdf']
                if not path.exists() or digest(path.read_bytes()) != asset['sha256']:
                    raise SystemExit(f'Missing or changed original PDF: {path}. Run npm run prepare:papers.')
                for page in asset['pages']:
                    image = ROOT / 'public' / page['path']
                    if not image.exists() or image.stat().st_size < 100:
                        raise SystemExit(f'Missing source page: {image}. Run npm run prepare:papers.')
                checked += 1
        print(f'Verified {len(data)} source sets, {checked} original PDFs and all page images.')
        return
    with ARCHIVE.open('rb') as archive:
        if hashlib.file_digest(archive, 'sha256').hexdigest() != EXPECTED:
            raise SystemExit('Archive checksum mismatch or LFS pointer not downloaded. Run git lfs pull first.')
    with zipfile.ZipFile(ARCHIVE) as archive:
        rows = [row for row in json.loads(archive.read('Paper_Index.json'))
                if 2023 <= row['year'] <= 2026 and row['collection'] in ['IGCSE_0620_P5', 'AS_AL_9701_P3']]
        # Do not quietly accept a renamed collection or an incomplete import.
        all_recent = [row for row in json.loads(archive.read('Paper_Index.json')) if 2023 <= row['year'] <= 2026]
        if len(rows) != len(all_recent) or len(rows) != 67:
            raise SystemExit(f'Unexpected source inventory: {len(rows)} of {len(all_recent)} (expected 67)')
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
        results = list(executor.map(prepare, rows))
    results.sort(key=lambda r: (r['code'], -r['year'], {'w': 0, 's': 1, 'm': 2}[r['session']], r['paper']))
    output = '// Generated by tools/prepare_past_papers.py from the checksum-verified archive.\n'
    output += 'export const ARCHIVE_DATA = ' + json.dumps(results, ensure_ascii=False, indent=2) + ' as const\n'
    (ROOT / 'src/papers/archive-data.ts').write_text(output)
    print(f'Prepared {len(results)} original question sets with mark schemes and materials; '
          f'{sum(len(r["assets"]["question"]["pages"]) for r in results)} question pages. No synthetic papers added.')


if __name__ == '__main__':
    main()
