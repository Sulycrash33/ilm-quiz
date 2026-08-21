"""Stems already stored for a category, for cross-tier duplicate checking.

Pass the tier file you are about to write as `exclude` so a re-run does not
collide with its own previous output.

Uses the shared literal tokenizer rather than a regex: the obvious pattern
r"\('((?:[^']|'')*)'" is ambiguous about where a doubled '' ends a literal
and can overrun into the next column, which produced spurious defect reports
before it was replaced.
"""
import glob
from parse_sql_literals import toks as literals


def load(pattern='f*.sql', exclude=None):
    out = []
    for f in sorted(glob.glob(pattern)):
        if exclude and f == exclude:
            continue
        for line in open(f):
            if not line.startswith("('"):
                continue
            lits = literals(line)
            if lits:
                out.append(lits[0])
    return out
