import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Navbar } from '../shared/components/Navbar';
import { AppRoutes } from './routes';
import { useAuthStore } from '../features/auth/ui/useAuthStore';

export const App: React.FC = () => {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white">
        <Navbar />
        <main className="flex-1">
          <AppRoutes />
        </main>
        <footer className="border-t border-slate-200/80 bg-white py-8 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-slate-600 font-medium">
              &copy; {new Date().getFullYear()} <strong className="text-slate-800">Who Is It</strong>. Built with privacy-first biometric engineering. Complies with GDPR Art. 9 &amp; Illinois BIPA.
            </p>
            <div className="flex items-center gap-4 text-slate-600 font-medium">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>WebCrypto AES-256 Vault Active</span>
              </span>
              <span>&bull;</span>
              <span className="text-slate-500">pgvector Cloud Match Active</span>
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
};
