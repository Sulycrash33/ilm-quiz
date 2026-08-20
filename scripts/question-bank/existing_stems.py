"""Stems already stored for a category, for cross-tier duplicate checking.
Pass the tier file you are about to write as `exclude` so a re-run does not
collide with its own previous output."""
import re, glob
def load(pattern='f*.sql', exclude=None):
    out=[]
    for f in sorted(glob.glob(pattern)):
        if exclude and f==exclude: continue
        for line in open(f):
            m=re.match(r"\('((?:[^']|'')*)'", line)
            if m: out.append(m.group(1).replace("''","'"))
    return out
