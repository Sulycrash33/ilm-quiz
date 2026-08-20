"""A faithful Python port of PostgreSQL pg_trgm's similarity().

The authoring pre-flight used to score stems by 4-gram Jaccard overlap while
`validate.sql` used pg_trgm. The two disagreed, so pairs passed locally and
failed in the database. This closes that gap: the pre-flight now computes the
same number the validator will.

pg_trgm's algorithm, confirmed against show_trgm() on the live database:
  - lower-case the string
  - split on every non-alphanumeric character (they are separators, not chars)
  - pad each word with TWO leading spaces and ONE trailing space
  - take every sliding window of 3 characters
  - collect them into a SET (duplicates collapse)
  - similarity = |A n B| / (|A| + |B| - |A n B|)

Verified against the database on real question text; see selftest() below.
"""

def trigrams(s: str) -> set:
    words, cur = [], []
    for ch in s.lower():
        if ch.isalnum():
            cur.append(ch)
        elif cur:
            words.append(''.join(cur)); cur = []
    if cur:
        words.append(''.join(cur))
    out = set()
    for w in words:
        padded = '  ' + w + ' '
        for i in range(len(padded) - 2):
            out.add(padded[i:i + 3])
    return out


def similarity(a: str, b: str) -> float:
    ta, tb = trigrams(a), trigrams(b)
    if not ta and not tb:
        return 0.0
    common = len(ta & tb)
    union = len(ta) + len(tb) - common
    return common / union if union else 0.0


def selftest():
    """Cases taken from the live database via similarity()/show_trgm()."""
    cases = [
        ('abc', 'abc', 1.0),
        ('hello world', 'hello  world!', 1.0),
        ("The Qur'an", 'the quran', 0.615385),
        ('What does the grade munkar indicate?',
         'What does the grade shadh indicate?', 0.690476),
        # Unicode: postgres treats U+FDFA as a WORD character (it hashes the
        # multibyte trigrams), while curly quotes and em dashes are separators.
        ('a \ufdfa b', 'a b', 0.666667),
        ('The Prophet (\ufdfa) said this', 'The Prophet (\ufdfa) said that', 0.76),
        ('Allah\u2019s Messenger', "Allah's Messenger", 1.0),
        ('x\u2019y \u201cz\u201d \u2014 w', 'x y z w', 1.0),
    ]
    ok = True
    for a, b, want in cases:
        got = round(similarity(a, b), 6)
        flag = 'ok' if abs(got - want) < 1e-6 else 'MISMATCH'
        if flag != 'ok':
            ok = False
        print(f'  {flag}: {got} (postgres {want})  {a[:38]!r}')
    n = len(trigrams('What does the grade munkar indicate?'))
    print(f'  {"ok" if n == 36 else "MISMATCH"}: trigram count {n} (postgres 36)')
    return ok and n == 36


if __name__ == '__main__':
    import sys
    sys.exit(0 if selftest() else 1)
