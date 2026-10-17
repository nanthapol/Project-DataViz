import React, { useState } from 'react';

import Sidebar from '../partials/Sidebar';
import Header from '../partials/Header';
import FilterButton from '../components/DropdownFilter';

// 1. นำเข้าเฉพาะการ์ดที่คุณสร้างขึ้นมาใหม่ (เช่น การ์ดแสดง Network Graph)
import SkillNetworkCard from '../partials/dashboard/SkillNetworkCard';
import TopSkillsCard from '../partials/dashboard/TopSkillsCard';

function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">

      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Content area */}
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">

        {/* Site header */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="grow">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">

            {/* Dashboard actions */}
            <div className="sm:flex sm:justify-between sm:items-center mb-8">

              {/* Left: Title */}
              <div className="mb-4 sm:mb-0">
                <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
                  First Jobber Insight
                </h1>
              </div>

              {/* Right: Actions / Filters */}
              <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
                {/* ตัวกรองเลือกตำแหน่งงาน หรือ บริษัท */}
                <FilterButton align="right" />
              </div>

            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-12 gap-6">

              {/* การ์ดสรุปทักษะยอดนิยม (กว้าง 4 คอลัมน์) */}
              <div className="col-span-12 xl:col-span-4">
                <TopSkillsCard />
              </div>

              {/* การ์ดแสดง Network Graph (กว้าง 8 คอลัมน์) */}
              <div className="col-span-12 xl:col-span-8">
                <SkillNetworkCard />
              </div>

            </div>

          </div>
        </main>

      </div>
    </div>
  );
}

export default Dashboard;