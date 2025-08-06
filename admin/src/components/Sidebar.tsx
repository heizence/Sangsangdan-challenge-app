import React from "react";
import Link from "next/link";

const Sidebar = () => {
  // 현재 경로를 확인하여 active 상태를 동적으로 적용해야 합니다. (useRouter 사용)
  const NavLink = ({ href, children, active = false }) => (
    <Link
      href={href}
      className={`flex items-center px-4 py-3 text-gray-300 transition-colors duration-200 transform rounded-md hover:bg-gray-700 ${
        active ? "bg-gray-700 text-white" : ""
      }`}
    >
      {children}
    </Link>
  );

  return (
    <div className="hidden md:flex flex-col w-64 bg-gray-800">
      <div className="flex items-center justify-center h-16 bg-gray-900">
        <span className="text-white font-bold uppercase text-lg">상상단 Admin</span>
      </div>
      <div className="flex flex-col flex-1 overflow-y-auto p-4">
        <nav>
          <NavLink href="/" active>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              ></path>
            </svg>
            <span className="ml-3">챌린지 관리</span>
          </NavLink>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
