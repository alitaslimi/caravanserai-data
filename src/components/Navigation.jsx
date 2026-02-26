import React from 'react';

const NAV_HEIGHT = 48; // px — exported as a constant so App can match padding

export { NAV_HEIGHT };

const Navigation = ({ variations, currentVariation, onVariationChange }) => {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6"
      style={{
        height: NAV_HEIGHT,
        backgroundColor: '#003B4C',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* Logo */}
      <span className="text-white font-semibold tracking-wide" style={{ fontSize: 13 }}>
        Caravanserai
      </span>

      {/* Right side */}
      <div className="flex items-center gap-5">

        {/* Variation toggle — only shown when more than one variation exists */}
        {variations.length > 1 && (
          <div
            className="flex items-center gap-1 rounded-md p-0.5"
            style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
          >
            {variations.map((v) => {
              const active = v === currentVariation;
              return (
                <button
                  key={v}
                  onClick={() => onVariationChange(v)}
                  className="rounded transition-all"
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    fontFamily: 'inherit',
                    padding: '3px 10px',
                    backgroundColor: active ? '#fff' : 'transparent',
                    color: active ? '#003B4C' : 'rgba(255,255,255,0.65)',
                    cursor: 'pointer',
                    border: 'none',
                    outline: 'none',
                  }}
                >
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              );
            })}
          </div>
        )}

        {/* Nav links */}
        <div className="flex items-center gap-4">
          {['About', 'Docs'].map((label) => (
            <a
              key={label}
              href="#"
              style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', textDecoration: 'none' }}
              onMouseEnter={(e) => (e.target.style.color = '#fff')}
              onMouseLeave={(e) => (e.target.style.color = 'rgba(255,255,255,0.55)')}
            >
              {label}
            </a>
          ))}
        </div>

      </div>
    </nav>
  );
};

export default Navigation;
