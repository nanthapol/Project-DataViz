export default function DataNotes({ M }) {
  const [from, to] = M.date_range;

  return (
    <div className="card">
      <h2>About this data</h2>
      <p className="note" style={{ marginTop: -6 }}>
        Read these limits before drawing conclusions from the charts.
      </p>

      <div className="dn-stats">
        <div><b>{M.total_postings.toLocaleString()}</b><span>job postings</span></div>
        <div><b>{M.n_jobs}</b><span>job titles</span></div>
        <div><b>{M.n_skills}</b><span>distinct skills after cleaning</span></div>
        <div><b>{from.slice(0, 4)}&ndash;{to.slice(0, 4)}</b><span>posting dates ({from} to {to})</span></div>
      </div>

      <ul className="dn">
        <li>
          <b>Skill stacks are fixed sets.</b> Each title has exactly 4 stacks, each used by about a quarter of its
          postings. Shares therefore move in steps (25%, 50%, 75%, 100%) and many skills tie exactly. Read the results
          as a picture of this dataset, not as the real job market.
        </li>
        <li>
          <b>Titles have very different sample sizes.</b> Five titles have 15,000+ postings; the other 17 have
          about 1,100 to 5,600. When several titles are combined, the large ones dominate totals such as Most Demanded
          Skills. Use the Scope option to look at one title.
        </li>
        <li>
          <b>Companies are not compared directly.</b> There are 7,563 companies and most posted once, so the company
          check only tests companies with 5+ postings of a title. It looks for a link between company and stack and
          finds none; it cannot rule out small effects, especially for titles with few postings.
        </li>
        <li>
          <b>Level, education and year are not filters.</b> Skill shares changed by about 3 percentage points on
          average across levels, so filtering by them would show almost nothing.
        </li>
        <li>
          <b>Skills were cleaned.</b> Combined entries such as Python/JavaScript were split into two skills and
          duplicate names merged (for example JIRA and Jira), which reduced 190 skills to {M.n_skills}. TCP/IP, PL/SQL,
          HTML/CSS and Cisco Routers/Switches were kept as single skills.
        </li>
        <li>
          <b>Job Family is our grouping.</b> The four families in the network and the title list were assigned for
          this dashboard and are not in the source data.
        </li>
        <li>
          <b>How shares are counted.</b> A share is the postings of a title that list the skill divided by all postings
          of that title. Percentages on pooled charts divide by all postings of the selected titles.
        </li>
      </ul>
    </div>
  );
}