import React from 'react';
import { UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  userRole?: UserRole | null;
  onLogout?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, userRole, onLogout }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.location.reload()}>
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md shadow-blue-200">T</div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">TSA <span className="text-blue-600">Master</span></h1>
          </div>
          
          <nav className="flex items-center gap-4">
            {userRole && (
              <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                <div className="flex flex-col items-end">
                   <span className="text-sm font-bold text-slate-700 capitalize">
                      {userRole === 'admin' ? 'Giáo viên' : 'Học sinh'}
                   </span>
                   <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                      {userRole}
                   </span>
                </div>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white shadow-sm ${userRole === 'admin' ? 'bg-purple-600' : 'bg-green-500'}`}>
                   {userRole === 'admin' ? (
                     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                   ) : (
                     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                   )}
                </div>
                {onLogout && (
                  <button 
                    onClick={onLogout}
                    className="ml-2 text-xs font-medium text-red-500 hover:text-red-700 hover:underline"
                  >
                    Thoát
                  </button>
                )}
              </div>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        {children}
      </main>
      <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <div>© {new Date().getFullYear()} TSA Master Pro.</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-800 transition-colors">Điều khoản</a>
            <a href="#" className="hover:text-slate-800 transition-colors">Bảo mật</a>
            <a href="#" className="hover:text-slate-800 transition-colors">Liên hệ</a>
          </div>
        </div>
      </footer>
    </div>
  );
};