import { useEffect, useRef, Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Brain, ArrowRight, Zap, Eye, Target, Shield, ChevronDown } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const NeuralBrain = lazy(() => import('../components/three/NeuralBrain'));

const FEATURES = [
  {
    icon: Brain,
    title: 'AI Memory Engine',
    description: 'Transforms raw transcripts into structured operational intelligence. Every word processed, every implication surfaced.',
    color: '#7c6aff',
  },
  {
    icon: Eye,
    title: 'Hidden Decision Detection',
    description: 'Surfaces implicit agreements and unstated decisions that were made but never formally acknowledged.',
    color: '#00d4ff',
  },
  {
    icon: Target,
    title: 'Accountability Tracking',
    description: 'Maps every commitment to a person, complete with AI-predicted risk of follow-through failure.',
    color: '#ff4ddb',
  },
  {
    icon: Zap,
    title: 'Risk Prediction',
    description: 'Scores each action item on likelihood of being missed, based on vagueness, ownership gaps, and timeline ambiguity.',
    color: '#ffb800',
  },
  {
    icon: Shield,
    title: 'Follow-Up Automation',
    description: 'Generates professional follow-up emails with all decisions, action items, and accountability assignments.',
    color: '#00e68a',
  },
  {
    icon: ArrowRight,
    title: 'Operational Memory',
    description: 'Builds a searchable organizational memory across all meetings. Never lose context again.',
    color: '#ff8800',
  },
];

export default function LandingPage() {
  const heroRef = useRef(null);
  const featuresRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero animation
      gsap.fromTo('.hero-tag', { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.2 });
      gsap.fromTo('.hero-title', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.4, ease: 'power2.out' });
      gsap.fromTo('.hero-sub', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, delay: 0.6 });
      gsap.fromTo('.hero-ctas', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.8 });
      gsap.fromTo('.hero-stats', { opacity: 0 }, { opacity: 1, duration: 0.8, delay: 1.1, stagger: 0.1 });

      // Features scroll animation
      gsap.fromTo('.feature-card',
        { opacity: 0, y: 40, scale: 0.95 },
        {
          opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.1,
          ease: 'back.out(1.2)',
          scrollTrigger: {
            trigger: featuresRef.current,
            start: 'top 75%',
          },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-void text-text-primary overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 backdrop-blur-xl bg-void/80">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shadow-glow-sm">
              <Brain size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-lg text-text-primary">
              Recall<span className="text-accent">IQ</span>
              <span className="text-neural-cyan text-sm ml-1">AI</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-ghost text-sm">Sign In</Link>
            <Link to="/register" className="btn-primary text-sm">Get Started Free</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section ref={heroRef} className="relative min-h-screen flex items-center pt-20">
        {/* Grid background */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `linear-gradient(rgba(124,106,255,0.05) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(124,106,255,0.05) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
        {/* Radial gradient */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
            style={{ background: 'radial-gradient(ellipse, rgba(124,106,255,0.12) 0%, transparent 70%)' }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center w-full">
          {/* Left: Copy */}
          <div className="relative z-10">
            <div className="hero-tag inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent/30 bg-accent/10 mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-neural-cyan animate-pulse" />
              <span className="text-xs font-mono text-accent-light tracking-widest uppercase">
                AI Operational Memory
              </span>
            </div>

            <h1 className="hero-title font-display font-bold text-5xl lg:text-6xl xl:text-7xl leading-[1.05] text-text-primary mb-6">
              Every meeting<br />
              <span className="text-transparent bg-clip-text"
                style={{ backgroundImage: 'linear-gradient(135deg, #7c6aff, #00d4ff, #ff4ddb)' }}>
                remembered.
              </span>
              <br />Nothing missed.
            </h1>

            <p className="hero-sub text-text-secondary text-lg leading-relaxed mb-8 max-w-xl">
              RecallIQ AI transforms meeting transcripts into living operational intelligence —
              surfacing hidden decisions, tracking accountability, and predicting what's about to fall through the cracks.
            </p>

            <div className="hero-ctas flex flex-wrap gap-3">
              <Link to="/register" className="btn-primary flex items-center gap-2 text-base px-7 py-3.5">
                Start Analyzing Free
                <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="btn-secondary text-base">
                Sign In
              </Link>
            </div>

            {/* Stats */}
            <div className="hero-stats flex flex-wrap gap-8 mt-10 pt-8 border-t border-border">
              {[
                { value: '10x', label: 'Faster than manual review' },
                { value: '94%', label: 'Decision capture rate' },
                { value: '0 missed', label: 'Action items' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="font-display font-bold text-2xl text-text-primary">{stat.value}</div>
                  <div className="text-xs text-text-muted mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Three.js Brain */}
          <div className="relative h-[500px] lg:h-[600px] hidden lg:block">
            <Suspense fallback={
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full border-2 border-accent border-t-transparent animate-spin" />
              </div>
            }>
              <NeuralBrain />
            </Suspense>
            {/* Glow underneath */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-32 rounded-full blur-3xl"
              style={{ background: 'rgba(124,106,255,0.2)' }} />
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-text-muted">
          <ChevronDown size={20} />
        </div>
      </section>

      {/* Features */}
      <section ref={featuresRef} className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-surface mb-4">
              <span className="text-xs font-mono text-text-secondary tracking-wider">CAPABILITIES</span>
            </div>
            <h2 className="font-display font-bold text-4xl text-text-primary">
              This is not a summarizer.
            </h2>
            <p className="text-text-secondary mt-4 max-w-2xl mx-auto">
              RecallIQ is an operational intelligence layer that understands the subtext of your meetings —
              not just what was said, but what was decided, implied, and at risk.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((feat) => (
              <div
                key={feat.title}
                className="feature-card card p-6 group cursor-default hover:border-opacity-40 transition-all duration-300"
                style={{ '--hover-color': feat.color }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${feat.color}15`, border: `1px solid ${feat.color}25` }}
                >
                  <feat.icon size={20} style={{ color: feat.color }} />
                </div>
                <h3 className="font-display font-semibold text-text-primary mb-2">{feat.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{feat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div
            className="rounded-2xl p-12 text-center relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(124,106,255,0.15), rgba(0,212,255,0.08))',
              border: '1px solid rgba(124,106,255,0.3)',
            }}
          >
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at center, rgba(124,106,255,0.1), transparent 70%)' }}
            />
            <div className="relative z-10">
              <h2 className="font-display font-bold text-4xl text-text-primary mb-4">
                Start with 100 free credits
              </h2>
              <p className="text-text-secondary mb-8">
                Analyze your first 10 meetings at no cost. No credit card required.
              </p>
              <Link to="/register" className="btn-primary text-lg px-10 py-4 inline-flex items-center gap-2">
                Get Started Free <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Brain size={16} className="text-accent" />
            <span className="font-display font-bold text-text-primary text-sm">
              RecallIQ AI
            </span>
          </div>
          <p className="text-text-muted text-xs">
            © 2025 RecallIQ AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
