import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const typeColors = {
  explicit: '#7c6aff',
  implicit: '#ffb800',
  hidden: '#ff4ddb',
};

const typeLabels = {
  explicit: 'EXPLICIT',
  implicit: 'IMPLICIT',
  hidden: 'HIDDEN',
};

const impactColors = {
  low: '#00e68a',
  medium: '#ffb800',
  high: '#ff8800',
  critical: '#ff4444',
};

export default function DecisionTimeline({ decisions = [] }) {
  const containerRef = useRef(null);
  const lineRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || decisions.length === 0) return;

    const items = containerRef.current.querySelectorAll('.timeline-item');
    const line = lineRef.current;

    // Animate the vertical line
    gsap.fromTo(line,
      { scaleY: 0, transformOrigin: 'top' },
      {
        scaleY: 1,
        duration: 1.5,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%',
          end: 'bottom 20%',
        },
      }
    );

    // Stagger animate each decision card
    gsap.fromTo(items,
      { opacity: 0, x: -30, scale: 0.96 },
      {
        opacity: 1,
        x: 0,
        scale: 1,
        duration: 0.6,
        stagger: 0.15,
        ease: 'back.out(1.2)',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 75%',
        },
      }
    );

    // Hover animations
    items.forEach((item) => {
      const dot = item.querySelector('.timeline-dot');
      
      item.addEventListener('mouseenter', () => {
        gsap.to(dot, { scale: 1.5, duration: 0.2 });
        gsap.to(item, { x: 6, duration: 0.2 });
      });
      item.addEventListener('mouseleave', () => {
        gsap.to(dot, { scale: 1, duration: 0.2 });
        gsap.to(item, { x: 0, duration: 0.2 });
      });
    });

    return () => ScrollTrigger.getAll().forEach((t) => t.kill());
  }, [decisions]);

  if (decisions.length === 0) {
    return (
      <div className="text-center py-8 text-text-muted font-body">
        No decisions detected yet
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative pl-10">
      {/* Vertical line */}
      <div
        ref={lineRef}
        className="absolute left-4 top-0 bottom-0 w-0.5"
        style={{
          background: 'linear-gradient(to bottom, #7c6aff, rgba(124,106,255,0.1))',
        }}
      />

      <div className="space-y-4">
        {decisions.map((decision, index) => {
          const color = typeColors[decision.type] || '#7c6aff';
          const impactColor = impactColors[decision.impact] || '#ffb800';

          return (
            <div key={decision._id || index} className="timeline-item relative">
              {/* Dot */}
              <div
                className="timeline-dot absolute -left-7 w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center"
                style={{
                  borderColor: color,
                  background: `${color}22`,
                  boxShadow: `0 0 8px ${color}44`,
                  top: '50%',
                  transform: 'translateY(-50%)',
                }}
              />

              {/* Card */}
              <div
                className="card p-4 cursor-default group"
                style={{ borderColor: `${color}30` }}
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {/* Type badge */}
                      <span
                        className="badge text-xs font-mono"
                        style={{
                          color,
                          background: `${color}15`,
                          border: `1px solid ${color}30`,
                        }}
                      >
                        {typeLabels[decision.type] || 'EXPLICIT'}
                      </span>

                      {/* Category */}
                      <span className="text-xs text-text-muted font-mono uppercase">
                        {decision.category}
                      </span>
                    </div>

                    <p className="text-text-primary font-body text-sm leading-relaxed">
                      {decision.description}
                    </p>

                    {decision.context && (
                      <p className="text-text-muted text-xs mt-2 italic">
                        Context: {decision.context}
                      </p>
                    )}

                    {decision.madeBy && (
                      <p className="text-text-secondary text-xs mt-1">
                        → {decision.madeBy}
                      </p>
                    )}
                  </div>

                  {/* Right side */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {/* Impact */}
                    <span
                      className="text-xs font-mono font-bold uppercase"
                      style={{ color: impactColor }}
                    >
                      {decision.impact} impact
                    </span>

                    {/* Confidence */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-text-muted">confidence</span>
                      <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${decision.confidence}%`,
                            background: color,
                          }}
                        />
                      </div>
                      <span className="text-xs font-mono" style={{ color }}>
                        {decision.confidence}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
