#!/usr/bin/env python3
"""
Strip blank lines and whitespace from an ASM file for LLM token counting.
Comments are preserved. Output goes to rawCode/<filename>.

Usage: python3 clean_for_llm.py PAC1.ASM
"""

import sys
import os

def clean(input_path):
    out_dir = os.path.join(os.path.dirname(input_path), "rawCode")
    os.makedirs(out_dir, exist_ok=True)

    out_path = os.path.join(out_dir, os.path.basename(input_path))

    with open(input_path, "r", encoding="ascii", errors="replace") as f:
        lines = f.readlines()

    cleaned = []
    for line in lines:
        line = line.rstrip()          # remove \r, \n, trailing spaces
        if line.strip():              # skip blank lines
            cleaned.append(line)

    with open(out_path, "w", encoding="ascii") as f:
        f.write("\n".join(cleaned) + "\n")

    print(f"Input : {input_path} ({len(lines)} lines)")
    print(f"Output: {out_path} ({len(cleaned)} lines)")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python3 clean_for_llm.py <file.ASM>")
        sys.exit(1)
    clean(sys.argv[1])
