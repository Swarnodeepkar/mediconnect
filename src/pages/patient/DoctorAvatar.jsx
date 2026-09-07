const SKIN_TONES = ['#f4c9a0', '#e0ab78', '#c68a5c', '#8d5a3c'];
const HAIR_COLORS = ['#2b1c17', '#4a3220', '#1c1c1c', '#5c4030', '#3b2a20'];

function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

// A friendly, illustrated doctor avatar generated from the doctor's id —
// never a photo of a real person, just a consistent placeholder per doctor.
export default function DoctorAvatar({ id = 'doc', accent = '#2f6fed', size = 120, className }) {
  const h = hash(id);
  const skin = SKIN_TONES[h % SKIN_TONES.length];
  const hair = HAIR_COLORS[(h >> 3) % HAIR_COLORS.length];
  const style = h % 3; // 0 = short crop, 1 = wavy top, 2 = bun
  const glasses = (h >> 5) % 5 === 0;

  return (
    <svg viewBox="0 0 160 160" width={size} height={size} className={className} role="img" aria-label="Doctor illustration">
      <defs>
        <linearGradient id={`bg-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="0.16" />
          <stop offset="100%" stopColor={accent} stopOpacity="0.32" />
        </linearGradient>
      </defs>

      <rect width="160" height="160" rx="28" fill={`url(#bg-${id})`} />

      {style === 2 && <circle cx="80" cy="46" r="12" fill={hair} />}

      {/* shoulders / coat */}
      <path d="M28 158 C28 118 52 100 80 100 C108 100 132 118 132 158 Z" fill="#ffffff" stroke="#d7dee8" strokeWidth="2" />
      <path d="M80 100 L64 118 L80 132 L96 118 Z" fill={accent} fillOpacity="0.85" />
      <path d="M60 104 L80 132 L70 116 Z" fill="#eef1f6" />
      <path d="M100 104 L80 132 L90 116 Z" fill="#eef1f6" />

      {/* stethoscope */}
      <path d="M58 108 C58 128 60 140 74 144 C82 146 88 140 88 132" fill="none" stroke="#7b8794" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M102 108 C102 128 100 140 88 132" fill="none" stroke="#7b8794" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="88" cy="133" r="6" fill="#9aa5b1" stroke="#7b8794" strokeWidth="1.5" />

      {/* neck */}
      <rect x="70" y="80" width="20" height="24" rx="8" fill={skin} />

      {/* head */}
      <circle cx="80" cy="60" r="30" fill={skin} />

      {/* ears */}
      <circle cx="50" cy="62" r="5" fill={skin} />
      <circle cx="110" cy="62" r="5" fill={skin} />

      {/* hair */}
      {style === 0 && <path d="M48 54 C48 30 62 18 80 18 C98 18 112 30 112 54 C112 44 100 34 80 34 C60 34 48 44 48 54 Z" fill={hair} />}
      {style === 1 && <path d="M46 52 C44 26 60 14 80 14 C100 14 116 26 114 52 C110 40 104 30 96 34 C90 26 84 36 80 30 C76 36 70 26 64 34 C56 30 50 40 46 52 Z" fill={hair} />}
      {style === 2 && (
        <>
          <path d="M48 54 C48 30 62 18 80 18 C98 18 112 30 112 54 C112 44 100 36 80 36 C60 36 48 44 48 54 Z" fill={hair} />
          <circle cx="80" cy="24" r="9" fill={hair} />
        </>
      )}

      {/* face */}
      <ellipse cx="69" cy="62" rx="3" ry="4" fill="#2c2c2c" />
      <ellipse cx="91" cy="62" rx="3" ry="4" fill="#2c2c2c" />
      <path d="M70 76 Q80 84 90 76" fill="none" stroke="#8a5a3c" strokeWidth="2.5" strokeLinecap="round" />

      {glasses && (
        <g fill="none" stroke="#3a3a3a" strokeWidth="2">
          <rect x="58" y="55" width="20" height="14" rx="6" />
          <rect x="82" y="55" width="20" height="14" rx="6" />
          <line x1="78" y1="61" x2="82" y2="61" />
        </g>
      )}
    </svg>
  );
}
