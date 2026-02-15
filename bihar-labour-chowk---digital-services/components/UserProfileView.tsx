
import React from 'react';
import { UserProfile, CallRequest } from '../types';

interface UserProfileViewProps {
  customer: UserProfile;
  requests: CallRequest[];
  onBack: () => void;
}

const UserProfileView: React.FC<UserProfileViewProps> = ({ customer, requests, onBack }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500 px-4 pb-20">
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 text-gray-400 hover:text-orange-600 transition-all"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Mera Profile</h2>
        <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 font-black">
          {customer.name.charAt(0).toUpperCase()}
        </div>
      </div>

      <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-sm border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full -mr-16 -mt-16"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
           <div className="w-24 h-24 bg-orange-600 rounded-[2rem] flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-orange-200">
             {customer.name.charAt(0).toUpperCase()}
           </div>
           <div className="space-y-1">
             <h3 className="text-3xl font-black text-gray-900">{customer.name}</h3>
             <p className="text-orange-600 font-black tracking-widest text-sm uppercase">{customer.phone}</p>
             <p className="text-gray-400 text-xs font-bold uppercase tracking-tight">Joined {new Date(customer.createdAt).toLocaleDateString()}</p>
           </div>
        </div>
      </div>

      <div className="space-y-6">
        <h4 className="text-xl font-black text-gray-900 flex items-center gap-3 ml-2">
          <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Mera Requests & History
        </h4>
        
        <div className="space-y-4">
          {requests.length > 0 ? [...requests].sort((a,b) => b.timestamp - a.timestamp).map(req => (
            <div key={req.id} className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between gap-6 hover:shadow-md transition-all">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    req.status === 'pending' ? 'bg-orange-100 text-orange-600' :
                    req.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {req.status}
                  </span>
                  <span className="text-[10px] font-black text-gray-300 uppercase">{new Date(req.timestamp).toLocaleDateString()}</span>
                </div>
                <div>
                  <h5 className="text-xl font-black text-gray-900">Worker: {req.workerName}</h5>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-0.5">Callback Requested</p>
                </div>
                {req.adminNote && (
                  <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Admin Update</p>
                    <p className="text-blue-700 font-bold text-sm leading-relaxed">{req.adminNote}</p>
                  </div>
                )}
              </div>
              <div className="flex items-end">
                <div className="text-right w-full md:w-auto">
                   <p className="text-[10px] font-black text-gray-300 uppercase mb-2">Ref ID: {req.id}</p>
                   {req.status === 'pending' && (
                     <div className="flex items-center gap-2 text-orange-600 font-black text-xs bg-orange-50 px-4 py-2 rounded-xl border border-orange-100">
                       <div className="w-2 h-2 bg-orange-600 rounded-full animate-ping"></div>
                       Admin is processing
                     </div>
                   )}
                </div>
              </div>
            </div>
          )) : (
            <div className="bg-gray-50 rounded-[3rem] p-20 text-center border-4 border-dashed border-gray-100">
              <div className="text-6xl mb-4 grayscale opacity-20">📭</div>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Abhi tak koi request nahi mili.</p>
              <button onClick={onBack} className="mt-6 text-orange-600 font-black text-sm hover:underline uppercase tracking-widest">Pehla Worker Dhundhein</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileView;
