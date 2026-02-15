
import React, { useState, useEffect } from 'react';
import { UserRole, Worker, CallRequest, UserProfile } from './types';
import { MOCK_WORKERS } from './constants';
import Layout from './components/Layout';
import UserPanel from './components/UserPanel';
import AdminPanel from './components/AdminPanel';
import UserProfileView from './components/UserProfileView';
import { auth, db } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { ref, onValue, set, update, remove, get } from 'firebase/database';
import AuthScreen from './components/AuthScreen';

const App: React.FC = () => {
  const [role, setRole] = useState<UserRole>('USER');
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [requests, setRequests] = useState<CallRequest[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loggedInCustomer, setLoggedInCustomer] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'PANEL' | 'PROFILE'>('PANEL');

  useEffect(() => {
    const savedCustomer = localStorage.getItem('chowk_customer');
    if (savedCustomer) {
      setLoggedInCustomer(JSON.parse(savedCustomer));
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const workersRef = ref(db, 'workers');
    const requestsRef = ref(db, 'requests');
    const metaRef = ref(db, 'metadata/seeded');

    // Better seeding: Only seed if a metadata flag 'seeded' is not present
    get(metaRef).then((snapshot) => {
      if (!snapshot.exists()) {
        const initialWorkers = MOCK_WORKERS as Worker[];
        initialWorkers.forEach(w => {
           set(ref(db, `workers/${w.id}`), w);
        });
        set(metaRef, true);
      }
    });

    const unsubscribeWorkers = onValue(workersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setWorkers(Object.values(data));
      } else {
        setWorkers([]);
      }
    });

    const unsubscribeRequests = onValue(requestsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setRequests(Object.values(data));
      } else {
        setRequests([]);
      }
    });

    return () => {
      unsubscribeWorkers();
      unsubscribeRequests();
    };
  }, []);

  const handleAddWorker = (worker: Worker) => {
    set(ref(db, `workers/${worker.id}`), worker);
  };

  const handleUpdateWorker = (worker: Worker) => {
    update(ref(db, `workers/${worker.id}`), worker);
  };

  const handleDeleteWorker = (id: string) => {
    const workerRef = ref(db, `workers/${id}`);
    remove(workerRef)
      .then(() => {
        console.log("Worker deleted successfully:", id);
      })
      .catch(err => {
        console.error("Delete failed:", err);
        alert("प्रोफाइल हटाने में समस्या हुई: " + err.message);
      });
  };

  const handleCreateRequest = async (request: CallRequest) => {
    const customerData: UserProfile = {
      phone: request.userPhone,
      name: request.userName,
      createdAt: Date.now()
    };
    
    await set(ref(db, `users/${request.userPhone}`), customerData);
    await set(ref(db, `requests/${request.id}`), request);
    
    setLoggedInCustomer(customerData);
    localStorage.setItem('chowk_customer', JSON.stringify(customerData));
  };

  const handleUpdateRequestStatus = (id: string, status: CallRequest['status'], adminNote?: string) => {
    const updates: any = { [`requests/${id}/status`]: status };
    if (adminNote !== undefined) updates[`requests/${id}/adminNote`] = adminNote;
    update(ref(db), updates);
  };

  const handleCustomerLogout = () => {
    setLoggedInCustomer(null);
    localStorage.removeItem('chowk_customer');
    setView('PANEL');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-orange-600 p-4">
        <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-3xl flex items-center justify-center text-orange-600 font-black text-4xl md:text-5xl shadow-2xl animate-bounce mb-6">
          B
        </div>
        <div className="text-white font-black text-lg md:text-xl uppercase tracking-widest animate-pulse text-center">
          Bihar Labour Chowk
        </div>
        <div className="mt-4 text-orange-200 text-sm font-bold opacity-80">लोड हो रहा है...</div>
      </div>
    );
  }

  return (
    <Layout 
      currentRole={role} 
      onRoleChange={(r) => { setRole(r); setView('PANEL'); }} 
      user={currentUser}
      customer={loggedInCustomer}
      onCustomerLogout={handleCustomerLogout}
      onViewProfile={() => setView('PROFILE')}
    >
      {role === 'USER' ? (
        view === 'PROFILE' && loggedInCustomer ? (
          <UserProfileView 
            customer={loggedInCustomer} 
            requests={requests.filter(r => r.userPhone === loggedInCustomer.phone)}
            onBack={() => setView('PANEL')}
          />
        ) : (
          <UserPanel 
            workers={workers} 
            onRequestCall={handleCreateRequest}
            customer={loggedInCustomer}
          />
        )
      ) : (
        currentUser ? (
          <AdminPanel 
            workers={workers} 
            requests={requests}
            onAddWorker={handleAddWorker}
            onUpdateWorker={handleUpdateWorker}
            onDeleteWorker={handleDeleteWorker}
            onUpdateRequestStatus={handleUpdateRequestStatus}
          />
        ) : (
          <AuthScreen />
        )
      )}
    </Layout>
  );
};

export default App;
