import React from 'react';
import { Link } from 'react-router-dom';
import {
  Scan,
  UserCheck,
  Lock,
  ShieldAlert,
  ArrowRight,
  Cpu,
  EyeOff,
  Scale,
} from 'lucide-react';
import { useAuthStore } from '../auth/ui/useAuthStore';
import { Button } from '../../shared/components/Button';
import { Card } from '../../shared/components/Card';

export const HomePage: React.FC = () => {
  const { user } = useAuthStore();

  const coreFeatures = [
    {
      title: 'Real-Time Object Detection',
      description:
        'Zero-latency, on-device object detection powered by EfficientDet-Lite0 running inside a high-performance Web Worker.',
      icon: Scan,
      color: 'from-cyan-500 to-blue-500',
      path: '/objects',
      badge: 'On-Device',
    },
    {
      title: 'Local Face Unlock',
      description:
        'Unlock your local session using MobileFaceNet embeddings and mandatory random liveness challenges. Your face unlocks credentials stored in IndexedDB.',
      icon: Lock,
      color: 'from-emerald-500 to-teal-500',
      path: '/unlock',
      badge: 'Convenience Factor',
    },
    {
      title: 'Consent-Based Identification',
      description:
        'Server-side vector search matching opted-in users only. Other people’s embedding vectors never touch client devices.',
      icon: UserCheck,
      color: 'from-purple-500 to-indigo-500',
      path: '/identify',
      badge: 'Server-Side Only',
    },
  ];

  const privacyPillars = [
    {
      title: 'No Raw Images Stored',
      description: 'Camera frames are processed in-memory and immediately discarded. Never persisted or uploaded.',
      icon: EyeOff,
    },
    {
      title: 'Web Worker Isolated',
      description: 'Heavy ML executes in dedicated background threads via OffscreenCanvas, keeping UI smooth.',
      icon: Cpu,
    },
    {
      title: 'BIPA & GDPR Compliant',
      description: 'Explicit versioned consent, 3-year statutory deletion cap, and single-click biometric purge.',
      icon: Scale,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 space-y-12">
      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-800 text-cyan-300 text-xs font-semibold">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Biometric Privacy by Design</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
          Intelligent Vision &amp; Identity with{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            Guaranteed Privacy
          </span>
        </h1>
        <p className="text-base sm:text-lg text-slate-400">
          A high-performance web platform combining on-device object detection,
          local face unlock convenience, and privacy-first consent-driven person identification.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {user ? (
            <Link to="/objects">
              <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Launch Camera Vision
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/signup">
                <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Get Started
                </Button>
              </Link>
              <Link to="/signin">
                <Button variant="secondary" size="lg">
                  Sign In
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* 3 Core Capability Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {coreFeatures.map((feat) => {
          const Icon = feat.icon;
          return (
            <Card key={feat.title} variant="glass" className="flex flex-col justify-between group hover:border-slate-700 transition-colors">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-xl bg-gradient-to-tr ${feat.color} text-slate-950 font-bold shadow-lg`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    {feat.badge}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                  {feat.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {feat.description}
                </p>
              </div>

              <div className="pt-6">
                <Link to={feat.path} className="block">
                  <Button variant="outline" size="sm" className="w-full justify-between">
                    <span>Open Mode</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Privacy Architecture Pillars */}
      <div className="border border-slate-800/80 rounded-3xl bg-slate-900/30 p-8 space-y-6">
        <h2 className="text-xl font-bold text-center text-slate-200">
          Non-Negotiable Privacy Commitments
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {privacyPillars.map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.title} className="flex gap-4 items-start">
                <div className="p-2.5 rounded-xl bg-slate-800 text-cyan-400 shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">{p.title}</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{p.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
