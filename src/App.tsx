/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserProfile } from './types';
import { Toaster } from 'sonner';

// Pages
import Dashboard from './pages/Dashboard';
import Marketplace from './pages/Marketplace';
import Admin from './pages/Admin';
import Login from './pages/Login';
import PublicHome from './pages/PublicHome';
import CategoryPage from './pages/CategoryPage';
import Layout from './components/Layout';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setUser(userDoc.data() as UserProfile);
          } else {
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              role: 'professor', // Default for demo
            });
          }
        } catch (e) {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            role: 'professor',
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white text-blue-700">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-100 border-t-blue-700"></div>
          <p className="font-bold tracking-widest text-sm uppercase">UNEXCA Central</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Toaster position="top-right" theme="light" />
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<PublicHome />} />
        <Route path="/category/:category" element={<CategoryPage />} />
        
        {/* Auth Route */}
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
        
        {/* Protected Routes */}
        <Route element={user ? <Layout user={user} /> : <Navigate to="/login" />}>
          <Route path="/dashboard" element={<Dashboard user={user} />} />
          <Route path="/marketplace" element={<Marketplace user={user} />} />
          {user?.role === 'admin' && <Route path="/admin" element={<Admin />} />}
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
