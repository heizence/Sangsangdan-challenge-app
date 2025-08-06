import React from "react";
import { useAuth } from "../context/AuthContext";

const Header = ({ pageTitle }) => {
  const { logout } = useAuth();

  return (
    <header className="flex justify-between items-center p-6 bg-white border-b-2 border-gray-200">
      <h1 className="text-2xl font-semibold text-gray-700">{pageTitle}</h1>
      <div className="flex items-center">
        <span className="text-gray-600 mr-4">관리자님</span>
        <button
          onClick={logout}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          로그아웃
        </button>
      </div>
    </header>
  );
};

export default Header;
