import React from 'react';
import { Outlet } from 'react-router-dom';

export const AdminLayout: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col overflow-hidden text-xs">
      <main className="flex-1 overflow-y-auto p-3.5" style={{ scrollbarWidth: 'thin' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
