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
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-white">
        <Navbar />
        <main className="flex-1">
          <AppRoutes />
        </main>
        <footer className="border-t border-slate-900 bg-slate-950/60 py-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>
              &copy; {new Date().getFullYear()} Who Is It. All rights reserved. Complies with GDPR Art. 9, Illinois BIPA 740 ILCS 14, and CCPA.
            </p>
            <div className="flex items-center gap-4 text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>WebCrypto AES-256 Active</span>
              </span>
              <span>&bull;</span>
              <span>Offscreen ML Worker Isolated</span>
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
};
