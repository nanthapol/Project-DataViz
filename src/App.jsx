import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

import './css/style.css';
import './charts/ChartjsConfig';

import JobSkills from './pages/JobSkills';
import StacksPage from './pages/StacksPage';
import CompanyPage from './pages/CompanyPage';
import TopSkillsPage from './pages/TopSkillsPage';
import AboutData from './pages/AboutData';

function App() {
  const location = useLocation();

  useEffect(() => {
    document.querySelector('html').style.scrollBehavior = 'auto';
    window.scroll({ top: 0 });
    document.querySelector('html').style.scrollBehavior = '';
  }, [location.pathname]);

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