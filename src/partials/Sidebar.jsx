import React, { useState, useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";

function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  variant = 'default',
}) {
  const location = useLocation();
  const { pathname } = location;

  const trigger = useRef(null);
  const sidebar = useRef(null);

  const storedSidebarExpanded = localStorage.getItem("sidebar-expanded");
  const [sidebarExpanded, setSidebarExpanded] = useState(storedSidebarExpanded === null ? false : storedSidebarExpanded === "true");

  // เมนูทั้งหมด (path ของไอคอนขนาด 16x16)
  const items = [
    {
      to: "/", label: "Job Skills Network",
      on: pathname === "/" || pathname.startsWith("/job-skills"),
      icon: [
        "M5.936.278A7.983 7.983 0 0 1 8 0a8 8 0 1 1-8 8c0-.722.104-1.413.278-2.064a1 1 0 1 1 1.932.516A5.99 5.99 0 0 0 2 8a6 6 0 1 0 6-6c-.53 0-1.045.076-1.548.21A1 1 0 1 1 5.936.278Z",
        "M6.068 7.482A2.003 2.003 0 0 0 8 10a2 2 0 1 0-.518-3.932L3.707 2.293a1 1 0 0 0-1.414 1.414l3.775 3.775Z",
      ],
    },
    {
      to: "/skill-stacks", label: "Skill Stacks",
      on: pathname.startsWith("/skill-stacks"),
      icon: ["M1 2h14v3H1V2Zm0 5h14v3H1V7Zm0 5h14v3H1v-3Z"],
    },
    {
      to: "/company-check", label: "Company Check",
      on: pathname.startsWith("/company-check"),
      icon: ["M1 15V2l7-2 7 2v13H1Zm3-3v2h2v-2H4Zm0-4v2h2V8H4Zm0-4v2h2V4H4Zm6 8v2h2v-2h-2Zm0-4v2h2V8h-2Zm0-4v2h2V4h-2Z"],
    },
    {
      to: "/top-skills", label: "Top Skills",
      on: pathname.startsWith("/top-skills"),
      icon: ["M1 9h3v6H1V9Zm5-4h3v10H6V5Zm5-4h3v14h-3V1Z"],
    },
    {
      to: "/about-data", label: "About data",
      on: pathname.startsWith("/about-data"),
      icon: ["M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0Zm1 12H7V7h2v5Zm0-6H7V4h2v2Z"],
    },
  ];

  // แบ่งกลุ่มเมนู
  const groups = [
    { title: "Insights", list: items.slice(0, 4) },
    { title: "Data", list: items.slice(4) },
  ];

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!sidebar.current || !trigger.current) return;
      if (!sidebarOpen || sidebar.current.contains(target) || trigger.current.contains(target)) return;
      setSidebarOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  });

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!sidebarOpen || keyCode !== 27) return;
      setSidebarOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  });

  useEffect(() => {
    localStorage.setItem("sidebar-expanded", sidebarExpanded);
    if (sidebarExpanded) {
      document.querySelector("body").classList.add("sidebar-expanded");
    } else {
      document.querySelector("body").classList.remove("sidebar-expanded");
    }
  }, [sidebarExpanded]);

  return (
    <div className="min-w-fit">
      {/* Sidebar backdrop (mobile only) */}
      <div
        className={`fixed inset-0 bg-gray-900/30 z-40 lg:hidden lg:z-auto transition-opacity duration-200 ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
      ></div>

      {/* Sidebar */}
      <div
        id="sidebar"
        ref={sidebar}
        className={`flex lg:flex! flex-col absolute z-40 left-0 top-0 lg:static lg:left-auto lg:top-auto lg:translate-x-0 h-[100dvh] overflow-y-scroll lg:overflow-y-auto no-scrollbar w-64 lg:w-20 lg:sidebar-expanded:!w-64 2xl:w-64! shrink-0 bg-white dark:bg-gray-800 p-4 transition-all duration-200 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-64"} ${variant === 'v2' ? 'border-r border-gray-200 dark:border-gray-700/60' : 'rounded-r-2xl shadow-xs'}`}
      >
        {/* Sidebar header */}
        <div className="flex justify-between mb-10 pr-3 sm:px-2">
          {/* Close button */}
          <button
            ref={trigger}
            className="lg:hidden text-gray-500 hover:text-gray-400"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-controls="sidebar"
            aria-expanded={sidebarOpen}
          >
            <span className="sr-only">Close sidebar</span>
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.7 18.7l1.4-1.4L7.8 13H20v-2H7.8l4.3-4.3-1.4-1.4L4 12z" />
            </svg>
          </button>
          {/* Logo */}
          <NavLink end to="/" className="block">
            <svg className="fill-violet-500" xmlns="http://www.w3.org/2000/svg" width={32} height={32}>
              <path d="M31.956 14.8C31.372 6.92 25.08.628 17.2.044V5.76a9.04 9.04 0 0 0 9.04 9.04h5.716ZM14.8 26.24v5.716C6.92 31.372.63 25.08.044 17.2H5.76a9.04 9.04 0 0 1 9.04 9.04Zm11.44-9.04h5.716c-.584 7.88-6.876 14.172-14.756 14.756V26.24a9.04 9.04 0 0 1 9.04-9.04ZM.044 14.8C.63 6.92 6.92.628 14.8.044V5.76a9.04 9.04 0 0 1-9.04 9.04H.044Z" />
            </svg>
          </NavLink>
        </div>

        {/* Links */}
        <div className="space-y-8">
          {groups.map(g => (
            <div key={g.title}>
              <h3 className="text-sm uppercase text-gray-500 dark:text-gray-400 font-semibold pl-3">
                <span className="hidden lg:block lg:sidebar-expanded:hidden 2xl:hidden text-center w-6" aria-hidden="true">
                  •••
                </span>
                <span className="lg:hidden lg:sidebar-expanded:block 2xl:block">{g.title}</span>
              </h3>

              <ul className="mt-3">
                {g.list.map(it => (
                  <li
                    key={it.to}
                    className={`px-3 py-2 rounded-lg mb-0.5 last:mb-0 ${it.on ? 'bg-violet-500/10 dark:bg-violet-500/20' : ''}`}
                  >
                    <NavLink
                      end
                      to={it.to}
                      className={`flex items-center font-medium ${it.on ? 'text-violet-500' : 'text-gray-800 dark:text-gray-100 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                      <svg
                        className={`shrink-0 fill-current ${it.on ? 'text-violet-500' : 'text-gray-400 dark:text-gray-500'}`}
                        xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"
                      >
                        {it.icon.map((d, i) => <path key={i} d={d} />)}
                      </svg>
                      <span className="text-sm ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200 truncate">
                        {it.label}
                      </span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default Sidebar;