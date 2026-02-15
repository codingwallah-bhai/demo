
import React, { useState, useMemo } from 'react';
import { Worker, CallRequest, UserProfile, WorkerCategory } from '../types';
import { BIHAR_DISTRICTS, CATEGORIES } from '../constants';
import WorkerCard from './WorkerCard';
import { suggestMatchingSkill } from '../services/geminiService';

interface UserPanelProps {
  workers: Worker[];
  onRequestCall: (req: CallRequest) => void;
  customer?: UserProfile | null;
}

const UserPanel: React.FC<UserPanelProps> = ({ workers, onRequestCall, customer }) => {
  const [search, setSearch] = useState('');
  const [villageSearch, setVillageSearch] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All Bihar');
  const [selectedCategory, setSelectedCategory] = useState('All Skills');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const filteredWorkers = useMemo(() => {
    return workers.filter(worker => {
      const matchesSearch = 
        worker.name.toLowerCase().includes(search.toLowerCase()) ||
        worker.skill.toLowerCase().includes(search.toLowerCase()) ||
        (worker.description && worker.description.toLowerCase().includes(search.toLowerCase()));
      
      const matchesVillage = !villageSearch || (worker.village && worker.village.toLowerCase().includes(villageSearch.toLowerCase()));
      const matchesLocation = selectedLocation === 'All Bihar' || worker.location === selectedLocation;
      const matchesCategory = selectedCategory === 'All Skills' || worker.skill === selectedCategory;
      
      return matchesSearch && matchesLocation && matchesCategory && matchesVillage;
    });
  }, [workers, search, villageSearch, selectedLocation, selectedCategory]);

  const handleSmartSearch = async () => {
    if (!search || search.length < 3) return;
    setIsAiLoading(true);
    try {
      const suggested = await suggestMatchingSkill(search);
      if (suggested) {
        const match = CATEGORIES.find(c => c.toLowerCase().includes(suggested.toLowerCase()));
        if (match) setSelectedCategory(match);
      }
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleQuickFilter = (category: string) => {
    setSelectedCategory(category);
    setSearch(''); // Clear manual search when selecting specific category
  };

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="bg-orange-600 rounded-[2.5rem] md:rounded-[4rem] px-6 py-12 md:p-20 text-white relative overflow-hidden shadow-2xl shadow-orange-200">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-400/20 rounded-full -ml-20 -mb-20 blur-3xl"></div>
        
        <div className="relative z-10 max-w-4xl">
          <h2 className="text-4xl md:text-7xl font-black mb-6 leading-[1.1] tracking-tight">
            बिहार के कारीगर, अब डिजिटल चौक पर!
          </h2>
          <p className="text-orange-50 text-lg md:text-xl mb-10 max-w-lg font-bold opacity-90">
            अपने ही गाँव और जिले में भरोसेमंद प्लंबर, बिजली मिस्त्री और मजदूर ढूंढें।
          </p>
          
          <div className="flex flex-col gap-6">
            <div className="relative group max-w-2xl">
              <input 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onBlur={handleSmartSearch}
                placeholder="खोजें: प्लंबर, मिस्त्री, लेबर..."
                className="w-full pl-14 pr-6 py-5 rounded-[2.5rem] text-gray-900 font-black text-lg md:text-xl focus:ring-8 focus:ring-white/30 outline-none transition-all placeholder:text-gray-400 shadow-2xl bg-white border-2 border-transparent"
              />
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-orange-600">
                {isAiLoading ? (
                  <div className="w-6 h-6 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )}
              </div>
            </div>

            {/* Quick Filters - Added back popular categories for one-click access */}
            <div className="flex flex-wrap gap-2 md:gap-3">
               <span className="w-full md:w-auto text-xs font-black uppercase tracking-widest text-orange-100 opacity-70 mb-1 md:mb-0 md:mt-2.5">लोकप्रिय:</span>
               {[
                 WorkerCategory.ELECTRICIAN, 
                 WorkerCategory.PLUMBER, 
                 WorkerCategory.LABOUR, 
                 WorkerCategory.MASON,
                 WorkerCategory.PAINTER
               ].map(cat => (
                 <button 
                   key={cat}
                   onClick={() => handleQuickFilter(cat)}
                   className={`text-[10px] md:text-xs font-black uppercase tracking-tight px-4 py-2.5 rounded-2xl transition-all border-2 ${
                     selectedCategory === cat 
                     ? 'bg-white text-orange-600 border-white shadow-lg' 
                     : 'bg-white/10 text-white border-white/20 hover:bg-white/30'
                   }`}
                 >
                   {cat.split(' ')[0]}
                 </button>
               ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-stretch md:items-end gap-6">
        <div className="flex-1 space-y-2">
          <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">जिला (District)</label>
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
            <select 
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full bg-transparent border-none text-base font-black text-gray-900 focus:ring-0 cursor-pointer p-0"
            >
              <option>All Bihar</option>
              {BIHAR_DISTRICTS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">अपना गाँव (Village)</label>
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex items-center gap-3">
            <svg className="w-5 h-5 text-orange-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
            </svg>
            <input 
              type="text"
              value={villageSearch}
              onChange={(e) => setVillageSearch(e.target.value)}
              placeholder="गाँव का नाम..."
              className="w-full bg-transparent border-none text-base font-black text-gray-900 focus:ring-0 p-0 placeholder:text-gray-300"
            />
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">हुनर (Skill)</label>
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-transparent border-none text-base font-black text-gray-900 focus:ring-0 cursor-pointer p-0"
            >
              <option>All Skills</option>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {(selectedLocation !== 'All Bihar' || villageSearch || selectedCategory !== 'All Skills' || search) && (
          <button 
            onClick={() => {
              setSelectedLocation('All Bihar');
              setVillageSearch('');
              setSelectedCategory('All Skills');
              setSearch('');
            }}
            className="md:mb-1 px-6 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all"
          >
            Clear
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 pb-20">
        {filteredWorkers.length > 0 ? (
          filteredWorkers.map(worker => (
            <WorkerCard 
              key={worker.id} 
              worker={worker} 
              onRequestCall={onRequestCall}
              existingCustomer={customer}
            />
          ))
        ) : (
          <div className="col-span-full py-24 text-center border-4 border-dashed border-gray-100 rounded-[3rem]">
            <div className="text-8xl mb-6 grayscale opacity-20">🚜</div>
            <h3 className="text-2xl font-black text-gray-900">कारीगर नहीं मिले</h3>
            <p className="text-gray-400 font-bold max-w-xs mx-auto mt-2 italic">कृपया गाँव या जिला बदल कर देखें।</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserPanel;
