import React from 'react';
import ForceGraph2D from 'react-force-graph-2d';

function SkillNetworkCard() {
  // 1. โครงสร้างข้อมูลจำลอง Nodes (ตำแหน่งงาน/ทักษะ) และ Links (เส้นเชื่อมโยง)
  const graphData = {
    nodes: [
      // Job Titles (จุดสีน้ำเงิน)
      { id: 'Data Engineer', group: 'job', val: 12 },
      { id: 'Data Scientist', group: 'job', val: 12 },
      { id: 'Data Analyst', group: 'job', val: 12 },
      // Skills (จุดสีเขียว)
      { id: 'Python', group: 'skill', val: 6 },
      { id: 'SQL', group: 'skill', val: 8 },
      { id: 'Tableau', group: 'skill', val: 5 },
      { id: 'Power BI', group: 'skill', val: 5 },
      { id: 'Spark', group: 'skill', val: 5 },
      { id: 'Machine Learning', group: 'skill', val: 6 },
    ],
    links: [
      // กำหนดความสัมพันธ์ระหว่างตำแหน่งงานกับทักษะ
      { source: 'Data Engineer', target: 'Python' },
      { source: 'Data Engineer', target: 'SQL' },
      { source: 'Data Engineer', target: 'Spark' },

      { source: 'Data Scientist', target: 'Python' },
      { source: 'Data Scientist', target: 'SQL' },
      { source: 'Data Scientist', target: 'Machine Learning' },

      { source: 'Data Analyst', target: 'SQL' },
      { source: 'Data Analyst', target: 'Tableau' },
      { source: 'Data Analyst', target: 'Power BI' },
      { source: 'Data Analyst', target: 'Python' },
    ],
  };

  return (
    <div className="flex flex-col bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700/60 p-5">
      <header className="px-2 py-3 border-b border-gray-100 dark:border-gray-700/60 flex justify-between items-center">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">
          Job Title & Skill Relationship Network
        </h2>
        <span className="text-xs text-gray-500">🔵 Job Title | 🟢 Skill</span>
      </header>

      {/* พื้นที่แสดง Network Graph */}
      <div className="w-full h-[450px] overflow-hidden rounded-lg bg-gray-50 dark:bg-gray-900 mt-4 flex items-center justify-center">
        <ForceGraph2D
          graphData={graphData}
          width={650}
          height={430}
          nodeCanvasObject={(node, ctx, globalScale) => {
            const label = node.id;
            const fontSize = 12 / globalScale;
            ctx.font = `${fontSize}px Sans-Serif`;
            
            // วาดวงกลมแสดง Node
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.val || 5, 0, 2 * Math.PI, false);
            ctx.fillStyle = node.group === 'job' ? '#3B82F6' : '#10B981';
            ctx.fill();

            // แสดงข้อความชื่อตำแหน่ง/ทักษะ
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#6B7280';
            ctx.fillText(label, node.x, node.y + (node.val || 5) + 8);
          }}
        />
      </div>
    </div>
  );
}

export default SkillNetworkCard;