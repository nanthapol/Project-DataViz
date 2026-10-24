"""
03_dashboard_data.py  -  Build the JSON files the web dashboard reads, and run the company check.

Input : data/processed/jobs_clean.csv
Output: <out dir>/job_skills.json     skills per job title (count and share)
        <out dir>/stacks.json         the skill stacks of each job title
        <out dir>/similarity.json     Jaccard similarity between job titles
        <out dir>/company_check.json  chi-square test: does the company decide the stack?
        <out dir>/meta.json           totals, families, caveats
Run   : python 03_dashboard_data.py [output_dir]      (default: ../public/data)

Company check
  A "stack" = the exact set of skills a posting lists. Each title has a few stacks.
  For every title we test whether stack choice depends on the company
  (chi-square test of independence, companies with >= 5 postings of that title).
  Bonferroni: with 22 titles tested, a result counts only when p < 0.05 / 22.
"""
import itertools
import json
import sys
from collections import Counter
from pathlib import Path

import pandas as pd
from scipy.stats import chi2_contingency

ROOT = Path(__file__).resolve().parent
PROC = ROOT / "data" / "processed"
OUT = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT.parent / "public" / "data"
OUT.mkdir(parents=True, exist_ok=True)

# Our own grouping of the 22 titles (not in the source data)
FAMILY = {
    "Data Analyst": "Data & Analytics", "Data Scientist": "Data & Analytics", "Data Engineer": "Data & Analytics",
    "Software Engineer": "Software Development", "Frontend Developer": "Software Development",
    "Backend Developer": "Software Development", "Full Stack Developer": "Software Development",
    "Mobile Developer": "Software Development", "QA Engineer": "Software Development",
    "Cloud Engineer": "Infrastructure & Security", "DevOps Engineer": "Infrastructure & Security",
    "Solutions Architect": "Infrastructure & Security", "System Administrator": "Infrastructure & Security",
    "Network Engineer": "Infrastructure & Security", "Database Administrator": "Infrastructure & Security",
    "IT Support Specialist": "Infrastructure & Security", "Cybersecurity Analyst": "Infrastructure & Security",
    "Product Manager": "Management & Product", "IT Manager": "Management & Product",
    "IT Project Manager": "Management & Product", "Scrum Master": "Management & Product",
    "Business Analyst": "Management & Product",
}


def dump(name, obj):
    with open(OUT / f"{name}.json", "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, separators=(",", ":"))


def main():
    f = pd.read_csv(PROC / "jobs_clean.csv", usecols=["Job_ID", "Job_Title", "Company", "Level", "Education",
                                                       "Date", "Skills"], dtype={"Skills": str})
    f["sk"] = f["Skills"].str.split(", ")
    n_total = len(f)
    jobs = f["Job_Title"].value_counts()
    assert set(FAMILY) == set(jobs.index), "FAMILY mapping does not match the job titles in the data"

    # job_skills.json
    js = {}
    for job, g in f.groupby("Job_Title"):
        n = len(g)
        c = Counter(s for l in g["sk"] for s in l)
        js[job] = {"family": FAMILY[job], "postings": n,
                   "skills": [{"skill": s, "count": v, "share": round(v / n, 4)} for s, v in c.most_common()]}
    dump("job_skills", js)

    # stacks.json
    st = f.groupby(["Job_Title", "Skills"]).size().reset_index(name="n")
    st["share"] = st["n"] / st["Job_Title"].map(jobs)
    dump("stacks", {j: [{"skills": r.Skills.split(", "), "postings": int(r.n), "share": round(r.share, 4)}
                        for r in g.sort_values("n", ascending=False).itertuples()]
                    for j, g in st.groupby("Job_Title")})

    # similarity.json
    sets = {j: {x["skill"] for x in o["skills"]} for j, o in js.items()}
    sim = []
    for a, b in itertools.combinations(sorted(sets), 2):
        i, u = sets[a] & sets[b], sets[a] | sets[b]
        sim.append({"a": a, "b": b, "jaccard": round(len(i) / len(u), 4), "shared": sorted(i)})
    dump("similarity", sorted(sim, key=lambda x: -x["jaccard"]))

    # company_check.json
    f["stack"] = f.groupby("Job_Title")["Skills"].transform(lambda s: s.factorize()[0])
    cc = f["Company"].value_counts()
    grp = f.groupby(["Job_Title", "Company"]).agg(n=("stack", "size"), k=("stack", "nunique"))
    grp = grp[grp["n"] >= 4]
    overall = {
        "companies": int(f["Company"].nunique()),
        "median_postings_per_company": float(cc.median()),
        "companies_ge10": int((cc >= 10).sum()),
        "share_postings_in_companies_ge10": round(float(cc[cc >= 10].sum() / n_total), 3),
        "groups_ge4": int(len(grp)),
        "share_groups_multi_stack": round(float((grp["k"] > 1).mean()), 3),
    }
    titles = {}
    for job, g in f.groupby("Job_Title"):
        vc = g["Company"].value_counts()
        keep = vc[vc >= 5].index
        h = g[g["Company"].isin(keep)]
        p = None
        if len(keep) >= 3:
            p = float(chi2_contingency(pd.crosstab(h["Company"], h["stack"]))[1])
        titles[job] = {"companies": int(len(keep)), "postings": int(len(h)),
                       "p": None if p is None else round(p, 3), "stacks": int(g["stack"].nunique())}
    dump("company_check", {"overall": overall, "alpha_corrected": round(0.05 / len(jobs), 4), "titles": titles})

    # meta.json
    fams = {}
    for j, fam in FAMILY.items():
        fams.setdefault(fam, []).append(j)
    dump("meta", {
        "total_postings": n_total, "n_jobs": int(len(jobs)),
        "n_skills": int(f["sk"].explode().nunique()),
        "date_range": [f["Date"].min(), f["Date"].max()],
        "levels": f["Level"].value_counts().to_dict(), "education": f["Education"].value_counts().to_dict(),
        "families": dict(sorted(fams.items())), "max_selected_jobs": 5,
    })
    print("written to", OUT)
    print({k: v for k, v in overall.items()})
    for j in ("Data Analyst", "Data Scientist", "Data Engineer"):
        print(j, titles[j])


if __name__ == "__main__":
    main()
