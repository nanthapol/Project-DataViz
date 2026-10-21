import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Sidebar from '../partials/Sidebar';
import Header from '../partials/Header';
import JobPicker from '../components/JobPicker';
import NetworkGraph from '../components/NetworkGraph';
import useJobData from '../utils/useJobData';
import { pct } from '../utils/Utils';
import { summarize } from '../utils/jobInsights';
import '../css/jobskills.css';

const MAX = 5;
const SHARES = [[0.25, '25%'], [0.5, '50%'], [0.75, '75%'], [1, '100%']];

export default function JobSkills() {
  const st = useLocation().state;
  const { data, err } = useJobData();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sel, setSel] = useState(st?.sel || ['Data Analyst', 'Data Scientist', 'Data Engineer']);
  const [minS, setMinS] = useState(0.25);
  const [pickerOpen, setPickerOpen] = useState(true);

  const toggle = job =>
    setSel(s => s.includes(job) ? s.filter(x => x !== job) : s.length < MAX ? [...s, job] : s);

  return (
    <div className="flex h-[100dvh] overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="grow">
          <div className="jsn px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            {err ? <p>Could not load data: {err}</p> : !data ? <p>Loading…</p> : (() => {
              const { J, M } = data;
              const sm = summarize(J, null, sel, 'All', minS);
              return (
                <>
                  <div className="head"><h1>First Jobber Insight</h1></div>

                  <div className={'grid' + (pickerOpen ? '' : ' full')}>
                    {pickerOpen && (
                      <div>
                        <JobPicker families={M.families} J={J} sel={sel} max={MAX}
                          onToggle={toggle} onClear={() => setSel([])}
                          onCollapse={() => setPickerOpen(false)} />
                      </div>
                    )}

                    <div>
                      <div className="card">
                        <div className="top">
                          <h2>Job Title &amp; Skill Relationship Network</h2>
                          <div className="lg2">
                            <span><b style={{ background: 'var(--fam)' }} />Job Family</span>
                            <span><b style={{ background: 'var(--job)' }} />Job Title</span>
                            <span><b style={{ background: 'var(--sk)' }} />Skill</span>
                            <span><b style={{ background: 'none', border: '2px solid var(--sh)' }} />Shared skill</span>
                          </div>
                        </div>

                        <div className="seg">
                          {!pickerOpen && (
                            <button className="open-btn" onClick={() => setPickerOpen(true)}>
                              &#9776; Select jobs ({sel.length}/{MAX})
                            </button>
                          )}
                          <span className="sp">Min share</span>
                          {SHARES.map(([v, t]) => (
                            <button key={v} className={v === minS ? 'on' : ''} onClick={() => setMinS(v)}>{t}</button>
                          ))}
                        </div>

                        <div className="fnote">
                          <b>Active filters:</b> {sel.length} title{sel.length === 1 ? '' : 's'}
                          {' '}({sm.postings.toLocaleString()} postings) &middot; min share &ge; {pct(minS)}
                          {' '}&rarr; showing <b>{sm.shown}</b> of {sm.total} skills.
                          <span>
                            Min share = postings of a title that list the skill &divide; all postings of that title.
                            A skill is drawn when it reaches this share in at least one selected title;
                            line thickness and the % on a highlighted line show that share.
                          </span>
                        </div>

                        <NetworkGraph J={J} L={null} sel={sel} level="All" minS={minS} />

                        <p className="note">
                          Hover a node to compare its links; click to pin the highlight, click empty space to clear.
                          Hover a line for the exact count.
                        </p>
                      </div>

                      <Link className="go" to="/key-findings" state={{ sel }}>
                        See skill stacks for these titles &rarr;
                      </Link>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </main>
      </div>
    </div>
  );
}