
import React, { useState } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

const AuthScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      console.error(err);
      setError("Login fail ho gaya. Kripya Email aur Password check karein.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 animate-in fade-in zoom-in duration-300">
      <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-orange-100 border border-gray-100">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-orange-600 rounded-3xl flex items-center justify-center text-white font-black text-3xl mx-auto mb-4 shadow-xl shadow-orange-200">
            A
          </div>
          <h2 className="text-2xl font-black text-gray-900">Admin Login</h2>
          <p className="text-gray-400 text-sm mt-1 font-medium">Sirf authorized admin hi access kar sakte hain.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm font-bold rounded-2xl border border-red-100 animate-pulse">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="space-y-5">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Admin Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:bg-white focus:border-orange-500 transition-all font-bold text-sm text-gray-900 placeholder:text-gray-300"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:bg-white focus:border-orange-500 transition-all font-bold text-sm text-gray-900 placeholder:text-gray-300"
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-2 bg-orange-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-orange-100 hover:bg-orange-700 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'ADMIN LOGIN'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Bihar Labour Chowk Admin Portal</p>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
