import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
  collapsed?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 28, className, collapsed = false }) => {
  return (
    <div className={className} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div style={{ 
        position: 'relative', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        filter: 'drop-shadow(0 0 8px rgba(79, 70, 229, 0.3))' // Base glow
      }}>
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ flexShrink: 0 }}
        >
          {/* Background rounded shape - responsive to theme via CSS variables if needed, 
              but here we use a consistent brand feel with improved contrast */}
          <rect 
            width="24" 
            height="24" 
            rx="7" 
            fill="var(--primary-color)" 
            className="logo-bg"
          />
          
          {/* Modern "W" Shape - using slightly thicker stroke for better weight */}
          <path
            d="M5.5 8.5L9 17.5L12 11L15 17.5L18.5 8.5"
            stroke="white"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      {!collapsed && (
        <span style={{ 
          fontSize: '17px', 
          fontWeight: 850, 
          color: 'var(--text-main)',
          letterSpacing: '-0.6px',
          fontFamily: 'var(--font-family)'
        }}>
          Working Note
        </span>
      )}
      <style>{`
        [data-theme='dark'] .logo-bg {
          fill: #818cf8; /* Indigo 400 - Much better visibility in dark mode */
        }
      `}</style>
    </div>
  );
};

export default Logo;
