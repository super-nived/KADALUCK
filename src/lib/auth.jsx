import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth } from './fbauth.js';
import { db } from './firebase.js';

const Ctx = createContext({ user: null, isAdmin: false, loading: true });

export function AuthProvider({ children }) {
  const [s, setS] = useState({ user: null, isAdmin: false, loading: true });
  useEffect(() => onAuthStateChanged(auth, async (user) => {
    if (!user) return setS({ user: null, isAdmin: false, loading: false });
    setS({ user, isAdmin: false, loading: true });
    let isAdmin = false;
    try { isAdmin = (await getDoc(doc(db, 'admins', user.uid))).exists(); } catch { /* not admin */ }
    setS({ user, isAdmin, loading: false });
  }), []);
  return <Ctx.Provider value={s}>{children}</Ctx.Provider>;
}
export const useAuth = () => useContext(Ctx);
export const login = (email, pw) => signInWithEmailAndPassword(auth, email, pw);
export const logout = () => signOut(auth);
