import { useState } from 'react';
import { NavLink, Routes, Route, Navigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { AuthProvider, useAuth, login, logout } from '../../lib/auth.jsx';
import { NutLoader, FormSkeleton } from '../../components/Loader.jsx';
import { Notice } from '../../components/ui.jsx';
import { Dashboard } from './Dashboard.jsx';
import { CampaignAdmin } from './CampaignAdmin.jsx';
import { SponsorAdmin } from './SponsorAdmin.jsx';
import { WinnersAdmin } from './WinnersAdmin.jsx';
import { VendorAdmin } from './VendorAdmin.jsx';
import { AuditLog } from './AuditLog.jsx';

function Login() {
  const [email, setEmail] = useState(''); const [pw, setPw] = useState('');
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setErr('');
    try { await login(email.trim(), pw); }
    catch { setErr('Sign-in failed. Check your email and password.'); }
    finally { setBusy(false); }
  };
  return (
    <form className="wrap card stack" onSubmit={submit} style={{ maxWidth: 420, margin: '0 auto' }}>
      <span className="eyebrow">Staff only</span><h1 style={{ fontSize: 28 }}>Admin sign-in</h1>
      <label className="f">Email<input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
      <label className="f">Password<input type="password" autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} required /></label>
      {err && <Notice err>{err}</Notice>}
      <button className="btn primary" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
    </form>
  );
}

export default function Admin() {
  return <AuthProvider><AdminGate /></AuthProvider>;
}

function AdminGate() {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return <div className="wrap"><NutLoader label="Checking access…" /><FormSkeleton fields={2} /></div>;
  if (!user) return <Login />;
  if (!isAdmin) {
    return (
      <div className="wrap card stack">
        <h1 style={{ fontSize: 24 }}>Not authorised</h1>
        <p className="muted">This account is signed in but is not an admin. An owner must add a document in the Firestore <code>admins</code> collection with this ID:</p>
        <input readOnly value={user.uid} onFocus={(e) => e.target.select()} aria-label="Your user ID" />
        <button className="btn ghost" onClick={logout}><LogOut size={18} /> Sign out</button>
      </div>
    );
  }
  const links = [['', 'Dashboard'], ['campaign', 'Campaign'], ['sponsor', 'Sponsor'], ['winners', 'Winners'], ['vendor', 'Vendor'], ['audit', 'Audit']];
  return (
    <div className="wrap">
      <div className="row"><h1 style={{ fontSize: 26 }}>Admin</h1><button className="chip" onClick={logout}><LogOut size={14} /> Sign out</button></div>
      <nav className="admin-nav" aria-label="Admin sections">
        {links.map(([to, label]) => <NavLink key={to} end={!to} to={`/admin/${to}`} className={({ isActive }) => (isActive ? 'active' : '')}>{label}</NavLink>)}
      </nav>
      <Routes>
        <Route index element={<Dashboard />} />
        <Route path="campaign" element={<CampaignAdmin />} />
        <Route path="sponsor" element={<SponsorAdmin />} />
        <Route path="winners" element={<WinnersAdmin />} />
        <Route path="vendor" element={<VendorAdmin />} />
        <Route path="audit" element={<AuditLog />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </div>
  );
}
