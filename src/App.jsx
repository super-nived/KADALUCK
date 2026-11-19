import { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, NavLink, Link, useLocation } from 'react-router-dom';
import { Home as HomeIcon, MapPin, Trophy, HelpCircle } from 'lucide-react';
import Home from './pages/Home.jsx';
import { PageSkeleton } from './components/Loader.jsx';
import { OfflineBar } from './components/ui.jsx';
import { useT } from './lib/i18n.jsx';
import { useOnline } from './lib/online.js';

const loaders = {
  how: () => import('./pages/How.jsx'),
  vendor: () => import('./pages/Vendor.jsx'),
  mystery: () => import('./pages/Mystery.jsx'),
  winners: () => import('./pages/Winners.jsx'),
  legal: () => import('./pages/Legal.jsx'),
  misc: () => import('./pages/Misc.jsx'),
  admin: () => import('./pages/admin/Admin.jsx'),
};
const How = lazy(loaders.how), Vendor = lazy(loaders.vendor), Mystery = lazy(loaders.mystery);
const Winners = lazy(loaders.winners), Legal = lazy(loaders.legal), Misc = lazy(loaders.misc), Admin = lazy(loaders.admin);
const WinnerDetail = lazy(() => import('./pages/Winners.jsx').then((m) => ({ default: m.WinnerDetail })));
const NotFound = lazy(() => import('./pages/Misc.jsx').then((m) => ({ default: m.NotFound })));
const OfflinePage = lazy(() => import('./pages/Misc.jsx').then((m) => ({ default: m.OfflinePage })));

export default function App() {
  const { t, lang, setLang } = useT();
  const online = useOnline();
  const loc = useLocation();

  // Warm the other route chunks once the home screen is idle -> instant tab switches.
  useEffect(() => {
    const warm = () => ['how', 'vendor', 'winners', 'mystery'].forEach((k) => loaders[k]());
    const id = window.requestIdleCallback ? requestIdleCallback(warm) : setTimeout(warm, 1500);
    return () => (window.cancelIdleCallback ? cancelIdleCallback(id) : clearTimeout(id));
  }, []);
  useEffect(() => { document.querySelector('main')?.scrollTo({ top: 0 }); }, [loc.pathname]);

  const tabs = [
    ['/', t('home'), HomeIcon, true],
    ['/vendor', t('vendor'), MapPin],
    ['/winners', t('winners'), Trophy],
    ['/how-it-works', t('how'), HelpCircle],
  ];

  return (
    <div className="app">
      <div>
        <OfflineBar online={online} />
        <header className="head">
          <Link to="/" className="brand" aria-label="KADALUCK home"><img src="/favicon.svg" alt="" /><span>KADA<b>LUCK</b></span></Link>
          <div className="head-actions">
            <button className="chip" onClick={() => setLang(lang === 'en' ? 'ml' : 'en')} aria-label="Switch language">{lang === 'en' ? 'മലയാളം' : 'EN'}</button>
          </div>
        </header>
      </div>
      <main>
        <Suspense fallback={<PageSkeleton />}>
          <div className="route-fade" key={loc.pathname}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/how-it-works" element={<How />} />
              <Route path="/vendor" element={<Vendor />} />
              <Route path="/mystery" element={<Mystery />} />
              <Route path="/sponsor/:cid" element={<Mystery />} />
              <Route path="/winners" element={<Winners />} />
              <Route path="/winners/:id" element={<WinnerDetail />} />
              {['rules', 'privacy', 'terms', 'accessibility', 'contact'].map((p) => <Route key={p} path={`/${p}`} element={<Legal page={p} />} />)}
              <Route path="/offline" element={<OfflinePage />} />
              <Route path="/admin/*" element={<Admin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </Suspense>
      </main>
      <nav className="tabs" aria-label="Main">
        {tabs.map(([to, label, Icon, end]) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => `tab${isActive ? ' active' : ''}`}>
            <Icon size={22} /><span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
