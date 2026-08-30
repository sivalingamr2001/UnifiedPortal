import React from 'react';
import { useLocation, Link } from 'react-router-dom';

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x && x !== 'unified-portal');

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-2">
        <li className="inline-flex items-center">
          <Link to="/" className="inline-flex items-center text-[10px] font-medium text-slate-500 hover:text-slate-700">
            Home
          </Link>
        </li>
        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          const label = value.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
          const isLast = index === pathnames.length - 1;

          return (
            <li key={to} className="flex items-center">
              <span className="mx-1.5 text-slate-300">/</span>
              {isLast ? (
                <span className="text-[10px] font-bold text-slate-700">{label}</span>
              ) : (
                <Link to={to} className="text-[10px] font-medium text-slate-500 hover:text-slate-700">
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
