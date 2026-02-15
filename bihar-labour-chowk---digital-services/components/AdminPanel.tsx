
import React, { useState, useRef, useEffect } from 'react';
import { Worker, CallRequest, WorkerCategory } from '../types';
import { BIHAR_DISTRICTS, CATEGORIES } from '../constants';
import WorkerCard from './WorkerCard';
import { optimizeProfileDescription } from '../services/geminiService';
import { storage } from '../firebase';
import { ref as sRef, uploadBytes, getDownloadURL } from 'firebase/storage';

interface AdminPanelProps {
  workers: Worker[];
  requests: CallRequest[];
  onAddWorker: (worker: Worker) => void;
  onUpdateWorker: (worker: Worker) => void;
  onDeleteWorker: (id: string) => void;
  onUpdateRequestStatus: (id: string, status: CallRequest['status'], adminNote?: string) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  workers, requests, onAddWorker, onUpdateWorker, onDeleteWorker, onUpdateRequestStatus 
}) => {
  const [activeTab, setActiveTab] = useState<'workers' | 'requests'>('workers');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingWorkerId, setEditingWorkerId] = useState<string | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedReqForNote, setSelectedReqForNote] = useState<CallRequest | null>(null);
  const [noteText, setNoteText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialFormState = {
    name: '',
    skill: CATEGORIES[0] as WorkerCategory,
    experience: 1,
    location: BIHAR_DISTRICTS[25], // Patna
    village: '',
    photoUrl: '',
    contactNumber: '',
    description: '',
    isVerified: true
  };

  const [formData, setFormData] = useState(initialFormState);

  const handleEdit = (worker: Worker) => {
    setFormData({
      name: worker.name,
      skill: worker.skill,
      experience: worker.experience,
      location: worker.location,
      village: worker.village || '',
      photoUrl: worker.photoUrl,
      contactNumber: worker.contactNumber,
      description: worker.description,
      isVerified: worker.isVerified
    });
    setEditingWorkerId(worker.id);
    setShowAddForm(true);
  };

  const closeForm = () => {
    setShowAddForm(false);
    setEditingWorkerId(null);
    setFormData(initialFormState);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const storageRef = sRef(storage, `worker_photos/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      setFormData(prev => ({ ...prev, photoUrl: url }));
    } catch (err) {
      console.error("Upload failed", err);
      alert("Photo upload fail ho gaya.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAiOptimize = async () => {
    if (!formData.description) return;
    setIsOptimizing(true);
    try {
      const optimized = await optimizeProfileDescription(
        formData.name, 
        formData.skill, 
        formData.experience, 
        formData.description
      );
      setFormData(prev => ({ ...prev, description: optimized }));
    } catch (err) {
      alert("AI optimization fail ho gayi.");
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.photoUrl) {
      alert("Kripya worker ki photo upload karein.");
      return;
    }

    if (editingWorkerId) {
      const updatedWorker: Worker = {
        ...formData,
        id: editingWorkerId,
        createdAt: workers.find(w => w.id === editingWorkerId)?.createdAt || Date.now()
      };
      onUpdateWorker(updatedWorker);
    } else {
      const newWorker: Worker = {
        ...formData,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: Date.now()
      };
      onAddWorker(newWorker);
    }
    closeForm();
  };

  const saveAdminNote = () => {
    if (!selectedReqForNote) return;
    onUpdateRequestStatus(selectedReqForNote.id, selectedReqForNote.status, noteText);
    setSelectedReqForNote(null);
    setNoteText('');
  };

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-sm">
        <div className="w-full md:w-auto">
          <h2 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tight">Admin Area</h2>
          <p className="text-gray-400 text-sm md:text-base font-bold">Manage workers and track customer requests.</p>
        </div>
        <div className="flex w-full md:w-auto gap-1 bg-gray-100 p-1.5 rounded-2xl">
          <button 
            onClick={() => setActiveTab('workers')}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-black transition-all whitespace-nowrap ${activeTab === 'workers' ? 'bg-white text-orange-600 shadow-md' : 'text-gray-500'}`}
          >
            Workers
          </button>
          <button 
            onClick={() => setActiveTab('requests')}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-black transition-all whitespace-nowrap flex items-center justify-center gap-2 ${activeTab === 'requests' ? 'bg-white text-orange-600 shadow-md' : 'text-gray-500'}`}
          >
            Requests
            {requests.filter(r => r.status === 'pending').length > 0 && (
              <span className="w-5 h-5 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center font-black animate-pulse">
                {requests.filter(r => r.status === 'pending').length}
              </span>
            )}
          </button>
        </div>
      </div>

      {activeTab === 'workers' ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-xl font-black text-gray-800">Total Workers ({workers.length})</h3>
            <button 
              onClick={() => setShowAddForm(true)}
              className="bg-orange-600 text-white px-5 py-3 rounded-2xl font-black text-sm shadow-xl shadow-orange-200 hover:bg-orange-700 active:scale-95 transition-all flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
              Add New
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {workers.map(worker => (
              <WorkerCard 
                key={worker.id} 
                worker={worker} 
                isAdmin={true}
                onDelete={onDeleteWorker}
                onEdit={handleEdit}
                onRequestCall={() => {}}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[900px]">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Client Details</th>
                  <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Target Worker</th>
                  <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status & Updates</th>
                  <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-900">
                {requests.length > 0 ? [...requests].sort((a,b) => b.timestamp - a.timestamp).map(req => {
                  const worker = workers.find(w => w.id === req.workerId);
                  return (
                    <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-6">
                        <div className="font-black text-gray-900 text-lg">{req.userName}</div>
                        <a href={`tel:${req.userPhone}`} className="text-orange-600 font-black text-xs hover:underline uppercase">{req.userPhone}</a>
                        <div className="text-[10px] text-gray-300 font-bold mt-1 uppercase">{new Date(req.timestamp).toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="font-black text-gray-800 text-base">{req.workerName}</div>
                        {worker && (
                           <div className="text-[10px] text-blue-600 font-black uppercase mt-1 flex items-center gap-1">
                             Call Worker: {worker.contactNumber}
                           </div>
                        )}
                      </td>
                      <td className="px-6 py-6 max-w-xs">
                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                          req.status === 'pending' ? 'bg-orange-100 text-orange-600' :
                          req.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                        }`}>
                          {req.status}
                        </span>
                        {req.adminNote && (
                          <p className="text-[10px] text-blue-500 font-bold mt-2 leading-relaxed italic">"{req.adminNote}"</p>
                        )}
                        <button 
                          onClick={() => { setSelectedReqForNote(req); setNoteText(req.adminNote || ''); }}
                          className="mt-2 text-[10px] font-black text-gray-400 hover:text-orange-600 uppercase tracking-widest block"
                        >
                          {req.adminNote ? 'Edit Note' : '+ Add Update'}
                        </button>
                      </td>
                      <td className="px-6 py-6 text-right">
                        <select 
                          value={req.status}
                          onChange={(e) => onUpdateRequestStatus(req.id, e.target.value as CallRequest['status'])}
                          className="text-xs font-black border-2 border-gray-100 rounded-xl focus:ring-orange-500 py-2 pl-4 pr-8 bg-gray-50 text-gray-900 cursor-pointer"
                        >
                          <option value="pending">Pending</option>
                          <option value="completed">Done</option>
                          <option value="cancelled">Cancel</option>
                        </select>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan={4} className="px-6 py-20 text-center text-gray-400 font-black uppercase">No requests found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Note Modal */}
      {selectedReqForNote && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-8 shadow-2xl animate-in zoom-in-95">
             <h4 className="text-2xl font-black text-gray-900 mb-2">Send Update</h4>
             <p className="text-gray-400 text-xs font-bold uppercase mb-6">Updating {selectedReqForNote.userName}'s request</p>
             <textarea 
               rows={4}
               value={noteText}
               onChange={(e) => setNoteText(e.target.value)}
               placeholder="Write update for customer... e.g. Worker will call in 10 mins."
               className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-orange-500 focus:bg-white transition-all font-bold text-sm text-gray-900"
             />
             <div className="flex gap-4 mt-8">
                <button onClick={() => setSelectedReqForNote(null)} className="flex-1 py-4 text-gray-400 font-black text-xs uppercase">Cancel</button>
                <button onClick={saveAdminNote} className="flex-[2] py-4 bg-orange-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-orange-100 hover:bg-orange-700 transition-all">SAVE UPDATE</button>
             </div>
          </div>
        </div>
      )}

      {showAddForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-[2.5rem] sm:rounded-[3rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in duration-300">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <h4 className="text-2xl font-black text-gray-900 tracking-tight">{editingWorkerId ? 'Edit Profile' : 'Add New Profile'}</h4>
              <button onClick={closeForm} className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-400 hover:text-red-500 shadow-sm transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[75vh] overflow-y-auto no-scrollbar pb-16">
              <div className="flex flex-col items-center mb-6">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-32 h-32 bg-gray-50 rounded-[2.5rem] border-4 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 transition-all overflow-hidden relative group shadow-inner"
                >
                  {formData.photoUrl ? (
                    <img src={formData.photoUrl} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-4">
                      <svg className="w-10 h-10 text-gray-300 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      <span className="text-[10px] font-black text-gray-300 uppercase">Upload</span>
                    </div>
                  )}
                  {isUploading && <div className="absolute inset-0 bg-white/90 flex items-center justify-center animate-pulse"><div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div></div>}
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-orange-500 transition-all font-bold text-gray-900" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Secret Phone</label>
                  <input type="tel" required value={formData.contactNumber} onChange={(e) => setFormData({...formData, contactNumber: e.target.value})} className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-orange-500 transition-all font-bold text-gray-900" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Skill</label>
                  <select value={formData.skill} onChange={(e) => setFormData({...formData, skill: e.target.value as WorkerCategory})} className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-orange-500 transition-all font-bold text-gray-900 cursor-pointer">{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Zila</label>
                  <select value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-orange-500 transition-all font-bold text-gray-900 cursor-pointer">{BIHAR_DISTRICTS.map(d => <option key={d}>{d}</option>)}</select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Gaon (Village)</label>
                  <input type="text" value={formData.village} onChange={(e) => setFormData({...formData, village: e.target.value})} className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-orange-500 transition-all font-bold text-gray-900" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Experience (Yrs)</label>
                  <input type="number" required value={formData.experience} onChange={(e) => setFormData({...formData, experience: parseInt(e.target.value)})} className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-orange-500 transition-all font-bold text-gray-900" />
                </div>
                <div className="flex items-center justify-center pt-6">
                   <button 
                     type="button"
                     onClick={() => setFormData({...formData, isVerified: !formData.isVerified})}
                     className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${formData.isVerified ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}
                   >
                     {formData.isVerified ? 'Profile Verified' : 'Mark Verified'}
                   </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Bio (Description)</label>
                  <button type="button" onClick={handleAiOptimize} disabled={isOptimizing || !formData.description} className="text-[10px] font-black text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-full transition-all disabled:opacity-30">
                    {isOptimizing ? 'Working...' : '✨ AI Polish'}
                  </button>
                </div>
                <textarea rows={4} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-3xl outline-none focus:bg-white focus:border-orange-500 transition-all font-bold text-sm text-gray-900 resize-none" />
              </div>

              <div className="pt-8 flex flex-col-reverse sm:flex-row gap-4">
                <button type="button" onClick={closeForm} className="w-full sm:flex-1 py-5 text-gray-400 font-black text-xs uppercase tracking-widest">Discard</button>
                <button type="submit" disabled={isUploading || isOptimizing} className="w-full sm:flex-[2] py-5 bg-orange-600 text-white rounded-[1.5rem] font-black text-sm shadow-2xl shadow-orange-600/30 hover:bg-orange-700 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50 uppercase tracking-widest">
                  {editingWorkerId ? 'Save Changes' : 'Create Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
