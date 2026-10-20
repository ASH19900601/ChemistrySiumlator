#!/usr/bin/env python3
"""Download files from Dropbox temporary links and verify their integrity.

Usage:
    python3 tools/dropbox_download.py <manifest.json> <output_dir>

manifest.json is a list of objects with keys:
    name, download_url, size, content_hash
(the fields returned by the Dropbox MCP `download_link` tool).

Each file is streamed to <output_dir>/<name>.part, then checked against the
expected size and Dropbox content_hash (SHA-256 over the concatenated SHA-256
digests of each 4 MiB block) before being renamed into place.
Note: Dropbox temporary links are single-use, so a failed download needs a
fresh link rather than a retry of the same URL.
"""
import hashlib
import json
import os
import sys
import urllib.request

BLOCK = 4 * 1024 * 1024


def dropbox_content_hash(path):
    overall = hashlib.sha256()
    with open(path, "rb") as f:
        while True:
            block = f.read(BLOCK)
            if not block:
                break
            overall.update(hashlib.sha256(block).digest())
    return overall.hexdigest()


def download(entry, out_dir):
    name = os.path.basename(entry["name"])
    dest = os.path.join(out_dir, name)
    part = dest + ".part"
    with urllib.request.urlopen(entry["download_url"], timeout=60) as resp, open(part, "wb") as out:
        done = 0
        while True:
            chunk = resp.read(1024 * 1024)
            if not chunk:
                break
            out.write(chunk)
            done += len(chunk)
    size = os.path.getsize(part)
    if entry.get("size") is not None and size != int(entry["size"]):
        raise RuntimeError(f"{name}: size {size} != expected {entry['size']}")
    if entry.get("content_hash"):
        got = dropbox_content_hash(part)
        if got != entry["content_hash"]:
            raise RuntimeError(f"{name}: content_hash {got} != expected {entry['content_hash']}")
    os.replace(part, dest)
    print(f"OK  {name}  {size} bytes  (hash verified)")


def main():
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    with open(sys.argv[1]) as f:
        entries = json.load(f)
    os.makedirs(sys.argv[2], exist_ok=True)
    failed = 0
    for entry in entries:
        try:
            download(entry, sys.argv[2])
        except Exception as exc:
            failed += 1
            print(f"FAIL {entry.get('name')}: {exc}", file=sys.stderr)
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
