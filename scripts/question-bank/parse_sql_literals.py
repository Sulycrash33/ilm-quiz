import json,re
def toks(line):
    """Proper SQL literal scanner: handles '' escapes unambiguously."""
    out=[];i=0;n=len(line)
    while i<n:
        if line[i]=="'":
            i+=1;buf=[]
            while i<n:
                if line[i]=="'":
                    if i+1<n and line[i+1]=="'": buf.append("'");i+=2
                    else: i+=1;break
                else: buf.append(line[i]);i+=1
            out.append(''.join(buf))
        else: i+=1
    return out
def rows(f):
    r=[]
    for line in open(f):
        if not line.strip(): continue
        t=toks(line)
        idx=int(re.search(r"',(\d+),'",line).group(1))
        r.append({'q':t[0],'choices':json.loads(t[1]),'i':idx,
                  'e':t[2],'cite':t[3],'meta':json.loads(t[4]),'raw':line.rstrip()})
    return r
