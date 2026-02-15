
import React, { useState, useEffect } from 'react';
import { Worker, CallRequest, UserProfile } from '../types';

interface WorkerCardProps {
  worker: Worker;
  onRequestCall: (req: CallRequest) => void;
  isAdmin?: boolean;
  onDelete?: (id: string) => void;
  onEdit?: (worker: Worker) => void;
  existingCustomer?: UserProfile | null;
}

const WorkerCard: React.FC<WorkerCardProps> = ({ worker, onRequestCall, isAdmin, onDelete, onEdit, existingCustomer }) => {
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [userName, setUserName] = useState(existingCustomer?.name || '');
  const [userPhone, setUserPhone] = useState(existingCustomer?.phone || '');
  const [requested, setRequested] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const placeholderImg = `https://ui-avatars.com/api/?name=${encodeURIComponent(worker.name)}&background=ffedd5&color=ea580c&size=256`;

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showRequestModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showRequestModal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName || !userPhone) return;

    const newRequest: CallRequest = {
      id: Math.random().toString(36).substr(2, 9),
      userName,
      userPhone,
      workerId: worker.id,
      workerName: worker.name,
      timestamp: Date.now(),
      status: 'pending'
    };

    onRequestCall(newRequest);
    setRequested(true);
    setTimeout(() => {
      setShowRequestModal(false);
      setRequested(false);
      if (!existingCustomer) {
        setUserName('');
        setUserPhone('');
      }
    }, 2000);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('क्या आप वाकई इस प्रोफाइल को हटाना चाहते हैं?')) {
      if (onDelete && worker.id) {
        onDelete(worker.id);
      }
    }
  };

  return (
    <>
      <div className={`group bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden transition-all duration-500 flex flex-col h-full relative ${showRequestModal ? '' : 'hover:shadow-2xl hover:shadow-orange-500/10 hover:-translate-y-2'}`}>
        <div className="relative aspect-[4/3] w-full bg-gray-50 overflow-hidden">
          {!imgLoaded && !imgError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-3 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
            </div>
          )}
          <img 
            src={imgError ? placeholderImg : (worker.photoUrl || placeholderImg)} 
            alt={worker.name} 
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
            className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          {worker.isVerified && (
            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md text-green-600 text-[10px] font-black px-4 py-2 rounded-2xl uppercase tracking-widest shadow-lg flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Verified
            </div>
          )}
        </div>
        
        <div className="p-6 flex-grow">
          <div className="flex justify-between items-start mb-1">
            <h3 className="text-xl font-black text-gray-900 leading-tight group-hover:text-orange-600 transition-colors">{worker.name}</h3>
            <span className="shrink-0 bg-orange-600 text-white text-[10px] font-black px-3 py-1.5 rounded-xl uppercase shadow-lg shadow-orange-100">
              {worker.experience}Y Exp
            </span>
          </div>
          
          <p className="text-gray-500 text-[11px] font-black mb-4 uppercase tracking-wider">{worker.skill}</p>
          
          <div className="space-y-2 mb-5">
            <div className="flex items-center text-gray-800 text-sm font-bold gap-2">
              <div className="w-8 h-8 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
              </div>
              {worker.location}, Bihar
            </div>
            {worker.village && (
              <div className="flex items-center text-gray-800 text-sm font-bold gap-2">
                <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                </div>
                गाँव: {worker.village}
              </div>
            )}
          </div>

          <p className="text-gray-700 text-sm italic font-medium leading-relaxed bg-gray-50/80 p-4 rounded-2xl border border-gray-100">
            "{worker.description || 'Bihar ke liye verified sevayein.'}"
          </p>
        </div>

        <div className="p-6 pt-0 flex gap-3">
          {isAdmin ? (
            <>
              <button 
                onClick={(e) => { e.stopPropagation(); onEdit?.(worker); }}
                className="flex-1 py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-black/10"
              >
                Edit
              </button>
              <button 
                onClick={handleDeleteClick}
                className="flex-1 py-4 bg-red-50 text-red-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-100 transition-all"
              >
                Hataein
              </button>
            </>
          ) : (
            <button 
              onClick={() => setShowRequestModal(true)}
              className="w-full py-4.5 bg-orange-600 text-white rounded-2xl font-black text-base shadow-2xl shadow-orange-600/30 hover:bg-orange-700 active:scale-[0.97] transition-all flex items-center justify-center gap-3 tracking-widest uppercase"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              सम्पर्क करें
            </button>
          )}
        </div>
      </div>

      {showRequestModal && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center animate-in fade-in duration-200">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-md" 
            onClick={() => setShowRequestModal(false)}
          ></div>
          <div className="bg-white h-full sm:h-auto sm:max-h-[90vh] w-full max-w-lg overflow-y-auto sm:rounded-[3rem] shadow-2xl relative z-10 flex flex-col animate-in zoom-in duration-300">
            <div className="p-6 flex justify-end bg-white sticky top-0 z-20">
              <button 
                onClick={() => setShowRequestModal(false)}
                className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-500 hover:text-red-500 transition-all shadow-sm"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="px-10 pb-10 text-center">
              <div className="w-24 h-24 bg-orange-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl">
                <svg className="w-12 h-12 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
              </div>
              <h4 className="text-4xl font-black text-gray-900 tracking-tight leading-tight">संपर्क का अनुरोध</h4>
              <p className="text-gray-600 text-lg mt-4 font-bold px-4 leading-relaxed italic">अपना विवरण दें, {worker.name} आपको जल्द ही कॉल करेंगे।</p>
            </div>
            
            <form onSubmit={handleSubmit} className="px-10 pb-20 sm:pb-12 space-y-8 flex-grow">
              {requested ? (
                <div className="bg-green-600 text-white p-10 rounded-[2.5rem] text-center font-black animate-in zoom-in duration-300 shadow-2xl shadow-green-200">
                  <div className="text-7xl mb-4">✅</div>
                  <h5 className="text-2xl mb-2 text-white">अनुरोध भेज दिया गया!</h5>
                  <p className="text-green-100 text-xs uppercase tracking-widest">सफलता</p>
                </div>
              ) : (
                <>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 ml-2">आपका पूरा नाम</label>
                      <input 
                        type="text" 
                        required
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="जैसे: राहुल कुमार"
                        className="w-full px-6 py-5 bg-gray-50 border-2 border-gray-100 rounded-[1.5rem] focus:border-orange-500 focus:bg-white outline-none transition-all font-black text-xl text-gray-900 placeholder:text-gray-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 ml-2">मोबाइल नंबर</label>
                      <input 
                        type="tel" 
                        required
                        value={userPhone}
                        onChange={(e) => setUserPhone(e.target.value)}
                        placeholder="9876543210"
                        className="w-full px-6 py-5 bg-gray-50 border-2 border-gray-100 rounded-[1.5rem] focus:border-orange-500 focus:bg-white outline-none transition-all font-black text-xl text-gray-900 placeholder:text-gray-400"
                      />
                    </div>
                  </div>
                  <div className="pt-4">
                    <button 
                      type="submit"
                      className="w-full py-6 bg-orange-600 text-white rounded-[2rem] font-black text-xl shadow-2xl shadow-orange-600/30 hover:bg-orange-700 transition-all active:scale-95 tracking-widest uppercase"
                    >
                      अनुरोध भेजें
                    </button>
                    <p className="text-center text-xs text-gray-400 font-bold mt-6 uppercase tracking-tight">सुरक्षित और मुफ्त सेवा</p>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default WorkerCard;
