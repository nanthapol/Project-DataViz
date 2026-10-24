"""
01_clean_data.py  -  Clean the IT job-postings dataset.

Input : data/raw/Combined_IT_Jobs_Dataset_v7.xlsx   (sheet "Jobs_Dataset (messy)")
Output: data/processed/jobs_clean.csv        one row per posting (107,284 rows, none dropped)
        data/processed/job_skills_long.csv   one row per (posting, skill)
        data/processed/skill_mapping.csv     every skill rename/split that was applied
Run   : python 01_clean_data.py [path/to/raw.xlsx]
"""
import re
import sys
from collections import Counter
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parent
RAW = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "data" / "raw" / "Combined_IT_Jobs_Dataset_v7.xlsx"
OUT = ROOT / "data" / "processed"
OUT.mkdir(parents=True, exist_ok=True)

# ----------------------------------------------------------------------------
# Cleaning rules (hand-written, see README "Cleaning rules")
# ----------------------------------------------------------------------------
# Entries that are really two skills -> split into two
SPLIT = {
    "Python/JavaScript": ["Python", "JavaScript"], "Java/.NET": ["Java", ".NET"],
    "Python/Django": ["Python", "Django"], "Windows/Mac": ["Windows", "macOS"],
    "Windows/Mac OS": ["Windows", "macOS"], "React/Vue.js": ["React", "Vue.js"],
    "Angular/.NET Core": ["Angular", ".NET Core"], "Flutter/React Native": ["Flutter", "React Native"],
    "React/Next.js": ["React", "Next.js"], "Vue.js/Python": ["Vue.js", "Python"],
    "Next.js/TypeScript": ["Next.js", "TypeScript"], "Java/Spring Boot": ["Java", "Spring Boot"],
    "React/Node.js": ["React", "Node.js"], "PHP/Laravel": ["PHP", "Laravel"],
    "Node.js/Python": ["Node.js", "Python"],
}
# Same skill written differently -> one name
SYN = {
    "JIRA": "Jira", "scikit-learn": "Scikit-Learn", "Jupyter": "Jupyter Notebook",
    "Spark": "Apache Spark", "Airflow": "Apache Airflow", "Oracle DB": "Oracle",
    "MS Office": "Microsoft Office",
}
# Kept as ONE skill although they contain "/": TCP/IP, PL/SQL, HTML/CSS, Cisco Routers/Switches

AU_STATES = {"NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "Victoria", "Queensland", "New South Wales",
             "Western Australia", "South Australia", "Tasmania", "Australian Capital Territory"}
US_HINT = {"California", "Texas", "New York", "Maine", "Washington D.C. Metro", "Greater New York City",
           "Florida", "Massachusetts", "Illinois"}
CNAME = {"USA": "United States", "US": "United States", "UK": "United Kingdom", "UAE": "United Arab Emirates",
         "australia": "Australia", "Czech republic": "Czech Republic"}
COUNTRIES = {
    "Australia", "United States", "United Kingdom", "India", "Netherlands", "Ireland", "New Zealand", "Canada",
    "South Africa", "United Arab Emirates", "Italy", "Brazil", "Japan", "Sweden", "Spain", "South Korea",
    "Germany", "Switzerland", "France", "Mexico", "Singapore", "Thailand", "Malaysia", "China", "Sri Lanka",
    "Iran", "Pakistan", "Denmark", "Turkey", "Indonesia", "Hong Kong", "Norway", "Finland", "Poland",
    "Czech Republic", "Philippines", "Vietnam", "Israel", "Belgium", "Austria", "Portugal", "Egypt", "Nigeria",
    "Kenya", "Argentina", "Chile", "Colombia", "Saudi Arabia", "Qatar",
}
CITY_C = {}
for c in ["Mumbai", "Pune", "Delhi", "Delhi/NCR", "Chennai", "Bengaluru / Bangalore", "Bangalore", "Kolkata",
          "Mohali", "Hyderabad/Secunderabad", "Gurgaon", "Chandigarh", "Ahmedabad", "Indore",
          "Noida/Greater Noida", "Panchkula", "Ludhiana", "Jaipur", "Thane", "Coimbatore", "Thiruvananthapuram"]:
    CITY_C[c] = "India"
for c in ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Canberra", "Gold Coast", "North Sydney",
          "Sydney CBD", "Chatswood", "North Ryde", "Parramatta", "Port Melbourne", "South Melbourne",
          "Macquarie Park", "Hilton SA", "Port Hedland WA", "St Leonards", "Surry Hills"]:
    CITY_C[c] = "Australia"
CITY_C.update({"Singapore": "Singapore", "Hong Kong": "Hong Kong", "Dubai": "United Arab Emirates",
               "Greater New York City Area": "United States", "Washington D.C. Metro Area": "United States",
               "London": "United Kingdom", "Dublin": "Ireland", "Wellington": "New Zealand",
               "Greater Seattle Area": "United States", "San Francisco Bay Area": "United States"})
CITY_FIX = {"Bengaluru / Bangalore": "Bengaluru", "Bangalore": "Bengaluru", "Hyderabad/Secunderabad": "Hyderabad",
            "Delhi/NCR": "Delhi", "Noida/Greater Noida": "Noida"}


def clean_skills(s, log):
    out = []
    for t in [x.strip() for x in s.split(",") if x.strip()]:
        if t in SPLIT:
            new = SPLIT[t]
            log[(t, " + ".join(new), "split compound skill")] += 1
        elif t in SYN:
            new = [SYN[t]]
            log[(t, SYN[t], "merge duplicate/synonym")] += 1
        else:
            new = [t]
        for x in new:
            if x not in out:          # a skill counts once per posting
                out.append(x)
    return out


def parse_location(v):
    """Return (city, country, quality). Never guesses: unknown stays 'Unknown'."""
    toks = [t.strip() for t in v.split(",") if t.strip()]
    if not toks or re.fullmatch(r"[\?\s\d\)\(]*", v) or ("?" in v and len(re.sub(r"[\?\s]", "", v)) < 3):
        return None, "Unknown", "Unresolved"
    stripped = re.sub(r" Area$", "", toks[-1])
    last = CNAME.get(stripped, stripped)
    if len(toks) >= 2:
        if last in COUNTRIES:
            return toks[0], last, "Standardized"
        if last in AU_STATES:
            return toks[0], "Australia", "Inferred"
        if last in US_HINT:
            return toks[0], "United States", "Inferred"
    first = toks[0]
    if len(toks) == 1 and CNAME.get(first, first) in COUNTRIES:
        return None, CNAME.get(first, first), "Country only"
    if first in CITY_C:
        return first, CITY_C[first], "Inferred"
    if first in AU_STATES:
        return None, "Australia", "Inferred"
    return first, "Unknown", "Unresolved"


def main():
    raw = pd.read_excel(RAW, sheet_name="Jobs_Dataset (messy)", dtype=str)
    n_raw = len(raw)
    raw_skills = Counter(t.strip() for s in raw["Skills/Tools"] for t in s.split(",") if t.strip())

    d = raw.copy()
    for c in d.columns:                                   # trim and collapse spaces
        d[c] = d[c].str.strip().str.replace(r"\s+", " ", regex=True)
    d.insert(0, "Job_ID", range(1, len(d) + 1))
    d["Date"] = pd.to_datetime(d["Date"], errors="coerce")
    d["Age"] = pd.to_numeric(d["Age"], errors="coerce").astype("Int64")
    assert d["Date"].notna().all() and d["Age"].notna().all(), "unparseable date/age"

    # skills
    log = Counter()
    sk = d["Skills/Tools"].map(lambda s: clean_skills(s, log))
    d["Skills_Raw"] = d["Skills/Tools"]
    d["Skills"] = sk.map(", ".join)
    d["Skill_Count"] = sk.map(len)

    # company: merge spellings that differ only by case / spaces
    key = d["Company"].str.lower()
    canon = d.groupby(key)["Company"].agg(lambda x: x.value_counts().index[0])
    d["Company_Clean"] = key.map(canon)
    d["Company_Encoding_Issue"] = d["Company_Clean"].str.contains(r"\?{2,}")

    # location
    uniq = d["Location"].unique()
    parsed = pd.DataFrame([parse_location(x) for x in uniq], columns=["City", "Country", "Location_Quality"], index=uniq)
    d = d.join(parsed, on="Location")
    d["City"] = d["City"].replace(CITY_FIX)
    d = d.rename(columns={"Location": "Location_Raw"})

    # derived columns for the dashboard
    d["Year"], d["Month"] = d["Date"].dt.year, d["Date"].dt.month
    d["Year_Month"] = d["Date"].dt.strftime("%Y-%m")
    d["Quarter"] = d["Date"].dt.year.astype(str) + "-Q" + d["Date"].dt.quarter.astype(str)
    d["Age_Group"] = pd.cut(d["Age"].astype(int), [17, 24, 34, 44, 54, 120],
                            labels=["18-24", "25-34", "35-44", "45-54", "55+"]).astype(str)
    d["Level_Order"] = d["Level"].map({"Entry": 1, "Junior": 2, "Mid": 3, "Senior": 4, "Lead": 5})
    d["Education_Order"] = d["Education"].map({"High School": 1, "Vocational / Diploma": 2, "Bachelor": 3,
                                               "Master": 4, "PhD": 5})
    d["Date"] = d["Date"].dt.strftime("%Y-%m-%d")

    final = d[["Job_ID", "Job Title", "Company_Clean", "Level", "Level_Order", "Responsibilities", "Skills",
               "Skill_Count", "Date", "Year", "Quarter", "Month", "Year_Month", "Age", "Age_Group", "City",
               "Country", "Location_Quality", "Location_Raw", "Education", "Education_Order",
               "Company_Encoding_Issue", "Skills_Raw"]]
    final = final.rename(columns={"Job Title": "Job_Title", "Company_Clean": "Company"})
    assert len(final) == n_raw and final["Job_ID"].is_unique, "rows were lost"

    final.to_csv(OUT / "jobs_clean.csv", index=False, encoding="utf-8-sig")
    long = final[["Job_ID", "Job_Title", "Level", "Country", "Year", "Skills"]].assign(
        Skill=final["Skills"].str.split(", ")).explode("Skill").drop(columns="Skills")
    long.to_csv(OUT / "job_skills_long.csv", index=False, encoding="utf-8-sig")
    pd.DataFrame([(a, b, c, n) for (a, b, c), n in log.most_common()],
                 columns=["Original", "Cleaned", "Action", "Rows_Affected"]).to_csv(
        OUT / "skill_mapping.csv", index=False, encoding="utf-8-sig")

    n_split = sum(n for (a, b, c), n in log.items() if c == "split compound skill")
    clean_distinct = final["Skills"].str.split(", ").explode().nunique()
    print(f"rows in/out            : {n_raw:,} / {len(final):,}")
    print(f"distinct skills        : {len(raw_skills)} raw -> {clean_distinct} clean")
    print(f"compound skills split  : {n_split:,} occurrences")
    print(f"companies              : {final['Company'].nunique():,}")
    print("location quality       :", final["Location_Quality"].value_counts().to_dict())
    print(f"written to             : {OUT}")


if __name__ == "__main__":
    main()
