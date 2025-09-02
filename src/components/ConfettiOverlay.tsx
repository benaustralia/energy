import { CONFETTI_COLORS } from '@/lib/constants';

interface ConfettiOverlayProps {
  showConfetti: boolean;
}

export const ConfettiOverlay = ({ showConfetti }: ConfettiOverlayProps) => {
  if (!showConfetti) return null;

  return (
    <>
      {/* Full-screen star confetti overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {Array.from({length: 100}, (_, i) => {
          const x = Math.random() * 100;
          const delay = Math.random() * 3;
          const duration = 3 + Math.random() * 2;
          const size = 20 + Math.random() * 30;
          const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
          
          return (
            <div
              key={i}
              className="absolute animate-pulse"
              style={{
                left: `${x}%`,
                top: '-50px',
                animationDelay: `${delay}s`,
                animationDuration: `${duration}s`,
                animationName: 'confetti-fall',
                animationIterationCount: '1',
                animationTimingFunction: 'linear'
              }}
            >
              <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes confetti-fall {
          to {
            transform: translateY(100vh) rotate(360deg);
          }
        }
      `}</style>
    </>
  );
};
