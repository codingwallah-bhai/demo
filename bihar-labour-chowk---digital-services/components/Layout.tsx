
import React, { useState } from 'react';
import { UserRole, UserProfile } from '../types';
import { User, signOut } from 'firebase/auth';
import { auth } from '../firebase';

interface LayoutProps {
  children: React.ReactNode;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  user: User | null;
  customer?: UserProfile | null;
  onCustomerLogout?: () => void;
  onViewProfile?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentRole, onRoleChange, user, customer, onCustomerLogout, onViewProfile }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-[100] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex justify-between items-center">
          <div className="flex items-center gap-2 md:gap-3 cursor-pointer" onClick={() => onRoleChange('USER')}>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-600 rounded-2xl flex items-center justify-center text-white font-black text-xl md:text-2xl shadow-lg shadow-orange-200">
              B
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg md:text-xl font-black text-gray-900 leading-none">Labour Chowk</h1>
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">Digital Bihar</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <div className="flex items-center bg-gray-100 p-1 rounded-2xl">
              <button
                onClick={() => onRoleChange('USER')}
                className={`px-3 md:px-5 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all ${
                  currentRole === 'USER' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500'
                }`}
              >
                Find Work
              </button>
              <button
                onClick={() => onRoleChange('ADMIN')}
                className={`px-3 md:px-5 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all ${
                  currentRole === 'ADMIN' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500'
                }`}
              >
                Admin
              </button>
            </div>

            {customer && currentRole === 'USER' && (
              <div className="relative">
                <button 
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="w-10 h-10 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 font-bold border-2 border-white shadow-sm overflow-hidden"
                >
                  {customer.name.charAt(0).toUpperCase()}
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2">
                    <button 
                      onClick={() => { onViewProfile?.(); setMenuOpen(false); }}
                      className="w-full text-left px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50"
                    >
                      My Profile
                    </button>
                    <button 
                      onClick={() => { onCustomerLogout?.(); setMenuOpen(false); }}
                      className="w-full text-left px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}

            {user && currentRole === 'ADMIN' && (
              <button 
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors bg-gray-50 rounded-xl"
              >
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        {children}
      </main>

      <footer className="bg-white border-t border-gray-100 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
             <div className="w-6 h-6 bg-orange-600 rounded flex items-center justify-center text-white text-[10px] font-bold">B</div>
             <p className="text-gray-400 text-xs font-bold uppercase tracking-tight">Bihar Labour Chowk</p>
          </div>
          <p className="text-gray-300 text-xs font-medium">Built for Bihar ❤️ 2024</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
