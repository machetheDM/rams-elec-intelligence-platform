export default function Logo({ className, showText = true }: { className?: string; showText?: boolean }) {
  return (
    <div className={`flex items-center gap-2.5 ${className ?? ""}`}>
      {/* Official Rams @Elec mark — house/roof with RE monogram */}
      <div className="flex-shrink-0 h-10 w-10 group-hover:scale-105 transition-transform">
        <svg viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full drop-shadow-lg">
          <path
            d="M5 50 L60 10 L115 50 V95 H5 V50 Z"
            fill="#f59e0b"
            fillOpacity="0.1"
            stroke="currentColor"
            strokeWidth="1"
            className="text-brand-500/10"
          />
          <path
            d="M0 55 L60 10 L120 55"
            stroke="#f59e0b"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <text
            x="60"
            y="82"
            textAnchor="middle"
            fill="white"
            fontWeight="900"
            fontSize="50"
            fontFamily="Inter, sans-serif"
            fontStyle="italic"
            className="tracking-tighter"
          >
            RE
          </text>
        </svg>
      </div>

      {/* Brand text */}
      {showText && (
        <div className="flex items-baseline gap-0.5">
          <span className="text-lg font-bold text-white tracking-tight">Rams</span>
          <span className="text-lg font-bold text-brand-500 tracking-tight">@Elec</span>
        </div>
      )}
    </div>
  );
}
