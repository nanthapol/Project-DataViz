export default function JobPicker({ families, J, sel, max, onToggle, onClear, onCollapse }) {
  return (
    <div className="card">
      <div className="ph">
        <h2>Select job titles</h2>
        <button className="lk" onClick={onCollapse} aria-label="Collapse job list">&#9664; Hide</button>
      </div>
      <div className="cnt">
        <span><b>{sel.length}</b>/{max} selected</span>
        <button className="lk" onClick={onClear}>Clear</button>
      </div>

      {Object.entries(families).map(([family, jobs]) => (
        <div key={family}>
          <div className="fam">{family}</div>
          {jobs.map(job => {
            const on = sel.includes(job);
            const dis = !on && sel.length >= max;
            return (
              <label key={job} className={'opt' + (dis ? ' dis' : '')}>
                <input type="checkbox" checked={on} disabled={dis} onChange={() => onToggle(job)} />
                {job}
                <span>{J[job].postings.toLocaleString()}</span>
              </label>
            );
          })}
        </div>
      ))}
    </div>
  );
}