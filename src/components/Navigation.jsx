import React from 'react';

const Navigation = ({ variations, currentVariation, onVariationChange }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-[#003B4C] z-50 flex items-center justify-between px-6 border-b border-white/10">
      {/* Logo */}
      <div className="text-white text-base font-semibold">
        Caravanserai
      </div>

      {/* Right side: Variations Toggle and Links */}
      <div className="flex items-center gap-6">
        {/* Variations Toggle */}
        {variations.length > 1 && (
          <div className="flex items-center gap-2 bg-white/10 rounded-lg p-1">
            {variations.map((variation) => (
              <button
                key={variation}
                onClick={() => onVariationChange(variation)}
                className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                  currentVariation === variation
                    ? 'bg-white text-[#003B4C]'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                {variation.charAt(0).toUpperCase() + variation.slice(1)}
              </button>
            ))}
          </div>
        )}

        {/* Navigation Links */}
        <div className="flex items-center gap-4">
          <a href="#" className="text-white/70 hover:text-white text-xs transition-colors">
            About
          </a>
          <a href="#" className="text-white/70 hover:text-white text-xs transition-colors">
            Docs
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

