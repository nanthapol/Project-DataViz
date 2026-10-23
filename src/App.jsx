import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

import './css/style.css';
import './charts/ChartjsConfig';

import JobSkills from './pages/JobSkills';
import StacksPage from './pages/StacksPage';
import CompanyPage from './pages/CompanyPage';
import TopSkillsPage from './pages/TopSkillsPage';
import AboutData from './pages/AboutData';

// บังคับโหมดสว่างตั้งแต่โหลดไฟล์ (ก่อน render ครั้งแรก)
document.documentElement.classList.remove('dark');
document.documentElement.style.colorScheme = 'light';
try {
  Object.keys(localStorage)
    .filter(k => /dark|theme/i.test(k))
    .forEach(k => localStorage.removeItem(k));
} catch {}

function App() {
  const location = useLocation();

  useEffect(() => {
    document.querySelector('html').style.scrollBehavior = 'auto';
    window.scroll({ top: 0 });
    document.querySelector('html').style.scrollBehavior = '';
  }, [location.pathname]);

  // กันกรณี ThemeContext ใส่คลาส dark กลับมาทีหลัง
  useEffect(() => {
    const html = document.documentElement;
    const obs = new MutationObserver(() => {
      if (html.classList.contains('dark')) html.classList.remove('dark');
    });
    obs.observe(html, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<JobSkills />} />
      <Route path="/job-skills" element={<JobSkills />} />
      <Route path="/skill-stacks" element={<StacksPage />} />
      <Route path="/company-check" element={<CompanyPage />} />
      <Route path="/top-skills" element={<TopSkillsPage />} />
      <Route path="/about-data" element={<AboutData />} />
      <Route path="/key-findings" element={<Navigate to="/skill-stacks" replace />} />
    </Routes>
  );
}

export default App;