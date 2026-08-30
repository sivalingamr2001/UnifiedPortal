import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Breadcrumbs } from '../../shell/Breadcrumbs';
import { useAuth } from '../auth/useAuth';
import { RotateCw, Menu } from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { user } = useAuth();

  const getInitial = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : 'A';
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden text-xs">
      {/* Sub-header status bar */}
      <div 
        className="flex items-center justify-between px-3 py-1 border-b shrink-0 bg-slate-50 border-slate-200" 
      >
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
          <span className="font-bold text-slate-700">Admin Module</span>
          <span className="text-slate-300">·</span>
          <span className="text-slate-400">System Identity, Mapping & Access Config</span>
        </div>
        <Link 
          to="/" 
          className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-600 transition-colors px-1.5 py-0.5 rounded hover:bg-slate-100 font-medium"
        >
          ← Back to Dashboard
        </Link>
      </div>

      {/* Internal page content routing */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Inner header showing Breadcrumbs */}
        <header 
          className="h-9 flex items-center justify-between px-3 border-b border-slate-200 bg-white shrink-0 shadow-sm"
        >
          <div className="flex items-center gap-2">
            <button className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors md:hidden">
              <Menu className="w-3.5 h-3.5" />
            </button>
            
            {/* Dynamic Breadcrumbs */}
            <Breadcrumbs />
          </div>

          <div className="flex items-center gap-2">
            <button className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors">
              <RotateCw className="w-3 h-3" />
            </button>
            <div className="h-3 w-px bg-slate-200 mx-0.5"></div>
            {user && (
              <div className="flex items-center gap-1.5">
                <div className="w-5.5 h-5.5 rounded-full flex items-center justify-center text-[9px] font-bold text-white bg-violet-600">
                  {getInitial(user.name)}
                </div>
                <div className="hidden md:block">
                  <div className="text-[10px] text-slate-900 font-bold leading-tight">{user.name}</div>
                  <div className="text-[8px] font-mono text-slate-500 leading-none">{user.role}</div>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Content Outlet for Admin Page */}
        <main className="flex-1 overflow-y-auto p-3.5" style={{ scrollbarWidth: 'thin' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
