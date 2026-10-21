import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../partials/Sidebar';
import Header from '../partials/Header';
import JobPicker from '../components/JobPicker';
import SkillStacks from '../components/SkillStacks';
import CompanyCheck from '../components/CompanyCheck';
import SkillBarChart from '../components/SkillBarChart';
import useJobData from '../utils/useJobData';
import '../css/jobskills.css';

const MAX = 5;

export default function KeyFindings() {
  const st = useLocation().state;
  const { data, err } = useJobData();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sel, setSel] = useState(st?.sel || ['Data Analyst', 'Data Scientist', 'Data Engineer']);
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
            {err ? <p>Could not load data: {err}</p> : !data ? <p>Loading…</p> : (
              <>
                <div className="head"><h1>Key Findings</h1></div>

                <div className={'grid' + (pickerOpen ? '' : ' full')}>
                  {pickerOpen && (
                    <div>
                      <JobPicker families={data.M.families} J={data.J} sel={sel} max={MAX}
                        onToggle={toggle} onClear={() => setSel([])}
                        onCollapse={() => setPickerOpen(false)} />
                    </div>
                  )}

                  <div>
                    {!pickerOpen && (
                      <div className="goRow">
                        <button className="open-btn" onClick={() => setPickerOpen(true)}>
                          &#9776; Select jobs ({sel.length}/{MAX})
                        </button>
                      </div>
                    )}

                    {sel.length === 0 ? (
                      <div className="card"><span className="note">Select up to 5 job titles to see key findings.</span></div>
                    ) : (
                      <>
                        <SkillStacks S={data.S} sel={sel} />
                        <CompanyCheck C={data.C} sel={sel} />
                        <SkillBarChart J={data.J} sel={sel} />
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}