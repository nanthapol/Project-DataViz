import { useEffect, useState } from 'react';

const KEY = 'jobskills-selection';
const PKEY = 'jobskills-picker-open';
const MAX = 5;
const DEFAULT = ['Data Analyst', 'Data Scientist', 'Data Engineer'];

function read() {
  try {
    const v = JSON.parse(sessionStorage.getItem(KEY));
    if (Array.isArray(v)) return v.slice(0, MAX);
  } catch (e) { /* ใช้ค่าเริ่มต้น */ }
  return DEFAULT;
}

// สถานะพับ/เปิดของรายการเลือกตำแหน่ง (เริ่มต้น = เปิด)
export function usePickerOpen() {
  const [open, setOpen] = useState(() => {
    try { return sessionStorage.getItem(PKEY) !== 'closed'; } catch (e) { return true; }
  });

  useEffect(() => {
    try { sessionStorage.setItem(PKEY, open ? 'open' : 'closed'); } catch (e) { /* ไม่เป็นไร */ }
  }, [open]);

  return [open, setOpen];
}

export default function useSelection() {
  const [sel, setSel] = useState(read);

  useEffect(() => {
    try { sessionStorage.setItem(KEY, JSON.stringify(sel)); } catch (e) { /* ไม่เป็นไร */ }
  }, [sel]);

  const toggle = job =>
    setSel(s => s.includes(job) ? s.filter(x => x !== job) : s.length < MAX ? [...s, job] : s);

  return { sel, setSel, toggle, MAX };
}