import { useState } from 'react';
import Sidebar from '../partials/Sidebar';
import Header from '../partials/Header';
import JobPicker from './JobPicker';
import useJobData from '../utils/useJobData';
import useSelection, { usePickerOpen } from '../utils/useSelection';
import '../css/jobskills.css';

export default function PageShell({ title, picker = true, children }) {
  const { data, err } = useJobData();
  const { sel: stored, setSel, toggle, MAX } = useSelection();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = usePickerOpen();

  // ตัดชื่อตำแหน่งที่ไม่มีในข้อมูลออก (กันค่าเก่าค้าง)
  const sel = data ? stored.filter(j => data.J[j]) : stored;

  return (
    <div className="flex h-[100dvh] overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="grow">
          <div className="jsn px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            {err ? <p>Could not load data: {err}</p> : !data ? <p>Loading…</p> : (
              <>
                <div className="head"><h1>{title}</h1></div>

                {!picker ? children({ data, sel }) : (
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

                      {sel.length === 0
                        ? <div className="card"><span className="note">Select up to 5 job titles to see results.</span></div>
                        : children({ data, sel })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}