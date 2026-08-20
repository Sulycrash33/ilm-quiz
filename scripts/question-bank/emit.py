"""Authoring helpers for the question-bank rebuild.

Usage while drafting one tier:

    import emit
    R = [ (question, [four_choices], correct_index, explanation, citation), ... ]
    R = emit.rebalance(R)                     # spread the answer across positions
    emit.check(R, "slug t3", existing)        # `existing` = stems already in the category
    open("t3.sql","w").write(emit.build("slug", 3, "easy", R))

Then paste the emitted SQL through the Supabase MCP tool and VERIFY THE TIER COUNT.

`check` is a pre-flight only. The authority is scripts/question-bank/validate.sql,
run against the whole category after the last tier lands.
"""
import json,sys,re,itertools
def lit(s): return "'"+s.replace("'","''")+"'"
def build(slug,tier,diff,rows,madhab='na'):
    """rows: list of (q, [choices], correct_index, explanation, citation)"""
    vals=[]
    for q,ch,i,e,c in rows:
        vals.append(f"({lit(q)},{lit(json.dumps(ch,ensure_ascii=False))},{i},{lit(e)},{lit(c)})")
    return (f"""insert into public.questions (
  category_id, tier, tier_is_estimated, difficulty, language,
  madhab_tag, question_text, choices, correct_choice_index,
  explanation, citation_reference, source_type, review_status, seed_batch
)
select (select id from public.categories where slug = '{slug}'),
  {tier}, false, '{diff}', 'en', '{madhab}',
  v.q, v.c::jsonb, v.i::smallint, v.e, v.cite,
  'ai_drafted', 'ai_drafted', 'rebuild-2026-08'
from (values
""" + ',\n'.join(vals) + "\n) as v(q, c, i, e, cite);\n")

def check(rows,label,existing=()):
    """`existing`: question_text values already stored for this category.
    Cross-tier collisions are the ones the per-tier eye misses."""
    probs=[]
    if len(rows)!=20: probs.append(f"{len(rows)} rows, not 20")
    qs=[r[0] for r in rows]
    if len(set(qs))!=len(qs): probs.append("duplicate stems")
    from collections import Counter
    ai=Counter(r[2] for r in rows)
    for k,v in ai.items():
        if v>7: probs.append(f"answer index {k} used {v}x")
    st=Counter(' '.join(q.split()[:3]).lower() for q in qs)
    for k,v in st.items():
        if v>4: probs.append(f"stem opening '{k}' used {v}x")
    for n,r in enumerate(rows,1):
        if len(r[1])!=4: probs.append(f"row {n}: not 4 choices")
        if len(set(r[1]))!=4: probs.append(f"row {n}: duplicate choices")
        if not (0<=r[2]<4): probs.append(f"row {n}: bad index")
        if not r[4].strip(): probs.append(f"row {n}: no citation")
    # crude near-duplicate: shared 4-grams between stems
    def grams(s): 
        w=re.sub(r'[^a-z ]','',s.lower()).split()
        return set(tuple(w[i:i+4]) for i in range(len(w)-3))
    for a,b in itertools.combinations(range(len(rows)),2):
        ga,gb=grams(qs[a]),grams(qs[b])
        if ga and gb:
            j=len(ga&gb)/len(ga|gb)
            if j>0.35: probs.append(f"stems {a+1}&{b+1} similar ({j:.2f})")
    # cross-tier: compare against what the category already holds
    for n,q in enumerate(qs,1):
        gq=grams(q)
        for e in existing:
            ge=grams(e)
            if gq and ge:
                j=len(gq&ge)/len(gq|ge)
                if j>0.35: probs.append(f"stem {n} similar to stored ({j:.2f}): {e[:50]}")
    allst=Counter(' '.join(x.split()[:3]).lower() for x in list(qs)+list(existing))
    for k,v in allst.items():
        if v>4: probs.append(f"category-wide stem opening '{k}' would be {v}x")
    print(f"{label}: " + ("PROBLEMS: "+"; ".join(probs) if probs else "clean"))
    return not probs

def spread(rows, seed=0):
    """Deterministically rotate each row's choices so the correct answer
    is not always in the same position. Keeps distractor order stable."""
    out=[]
    for n,(q,ch,i,e,c) in enumerate(rows):
        correct=ch[i]; rest=[x for k,x in enumerate(ch) if k!=i]
        pos=(n+seed)%4
        new=rest[:pos]+[correct]+rest[pos:]
        out.append((q,new,pos,e,c))
    return out

def rebalance(rows):
    """Force an even 5/5/5/5 spread of the correct-answer position."""
    out=[]
    for n,(q,ch,i,e,c) in enumerate(rows):
        correct=ch[i]; rest=[x for k,x in enumerate(ch) if k!=i]
        pos=n%4
        out.append((q,rest[:pos]+[correct]+rest[pos:],pos,e,c))
    return out
