import React from 'react';

function TopSkillsCard() {
  const topSkills = [
    { name: 'SQL', count: 142, percentage: '85%' },
    { name: 'Python', count: 120, percentage: '72%' },
    { name: 'Power BI', count: 88, percentage: '53%' },
    { name: 'Tableau', count: 65, percentage: '39%' },
  ];

  return (
    <div className="flex flex-col bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700/60 p-5">
      <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Top Demanded Skills</h2>
      <ul className="space-y-3">
        {topSkills.map((skill, index) => (
          <li key={index} className="flex justify-between items-center text-sm">
            <span className="font-medium text-gray-700 dark:text-gray-300">{skill.name}</span>
            <span className="text-gray-500">{skill.count} jobs ({skill.percentage})</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TopSkillsCard;