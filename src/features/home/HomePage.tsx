import React from 'react';
import { Link } from 'react-router-dom';
import {
  Scan,
  UserCheck,
  Lock,
  ShieldCheck,
  ArrowRight,
  Cpu,
  EyeOff,
  Scale,
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '../auth/ui/useAuthStore';
import { Button } from '../../shared/components/Button';
import { Card } from '../../shared/components/Card';

export const HomePage: React.FC = () => {
  const { user } = useAuthStore();

  const coreFeatures = [
    {
      title: 'Consent-Based Identification',
      description:
        'Point your camera at any enrolled subject to verify their identity through database vector cosine matching (threshold >= 0.75).',
      icon: UserCheck,
      gradient: 'from-indigo-600 to-violet-600',
      badge: 'Database Vector Match',
      path: '/identify',
      actionText: 'Open Identification Mode',
      primary: true,
    },
    {
      title: '1st-Login Face Registration',
      description:
        'Every user registers their facial embedding vector on first login with randomized liveness challenges (blink / turn head) to prevent spoofs.',
      icon: Lock,
      gradient: 'from-emerald-600 to-teal-500',
      badge: 'Mandatory Setup',
      path: '/enroll',
      actionText: 'Register Face Template',
      primary: false,
    },
    {
      title: 'Real-Time Object Detection',
      description:
        'Zero-latency, on-device object detection powered by EfficientDet-Lite0 running completely isolated in a high-performance Web Worker.',
      icon: Scan,
      gradient: 'from-blue-600 to-cyan-500',
      badge: 'On-Device Vision',
      path: '/objects',
      actionText: 'Open Object Vision',
      primary: false,
    },
  ];

  const privacyPillars = [
    {
      title: 'No Raw Images Stored',
      description: 'Camera video frames are processed in-memory and immediately wiped. No photos are ever saved or uploaded.',
      icon: EyeOff,
    },
    {
      title: 'Web Worker Isolation',
      description: 'Heavy ML executes in dedicated background threads via OffscreenCanvas, ensuring lightning-fast UI responsiveness.',
      icon: Cpu,
    },
    {
      title: 'BIPA & GDPR Compliant',
      description: 'Explicit informed consent, 3-year statutory deletion cap, and 1-click permanent data deletion.',
      icon: Scale,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 sm:py-16 space-y-16">
      {/* Hero Section */}
      <div className="text-center space-y-5 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-bold tracking-wide shadow-subtle">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>Next-Generation Vision &amp; Identity</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
          Intelligent Camera Vision with{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500">
            Guaranteed Privacy
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
          A high-performance biometric platform combining real-time camera face identification,
          anti-spoof liveness verification, and private on-device vision.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
          {user ? (
            <Link to="/identify">
              <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Launch Camera Identification
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/signup">
                <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Create Free Account
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
            <Card
              key={feat.title}
              className={`flex flex-col justify-between group hover:-translate-y-1 transition-all duration-200 ${
                feat.primary
                  ? 'border-indigo-300 ring-2 ring-indigo-500/10 shadow-float'
                  : 'border-slate-200/90 hover:border-slate-300'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`p-3.5 rounded-2xl bg-gradient-to-tr ${feat.gradient} text-white shadow-md shadow-indigo-600/20`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    {feat.badge}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {feat.title}
                </h3>

                <p className="text-sm text-slate-600 leading-relaxed">
                  {feat.description}
                </p>
              </div>

              <div className="pt-6">
                <Link to={feat.path} className="block">
                  <Button
                    variant={feat.primary ? 'primary' : 'outline'}
                    size="md"
                    className="w-full justify-between"
                  >
                    <span>{feat.actionText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Privacy Architecture Pillars */}
      <div className="border border-slate-200/90 rounded-3xl bg-white p-8 sm:p-10 shadow-card space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Non-Negotiable Privacy Commitments</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">
            How We Protect Your Biometric Rights
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {privacyPillars.map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.title} className="flex gap-4 items-start">
                <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 shrink-0 border border-indigo-100 shadow-subtle">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">{p.title}</h4>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{p.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
