interface Props {
  size?: number;
}

/**
 * NutriAI brand logo — rounded-square badge with a leaf + AI sparkle.
 * The green gradient is baked in, so no wrapper div needed.
 */
export default function NutriAILogo({ size = 40 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id="nutriai-bg"
          x1="0" y1="0" x2="40" y2="40"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%"   stopColor="#2D4A3E" />
          <stop offset="100%" stopColor="#4A7C6B" />
        </linearGradient>
      </defs>

      {/* Badge background */}
      <rect width="40" height="40" rx="11" fill="url(#nutriai-bg)" />

      {/* Leaf body — diagonal, tip upper-right */}
      <path
        d="M11 31 Q6 15 24 9 Q31 25 11 31Z"
        fill="white"
        opacity="0.93"
      />

      {/* Leaf centre vein */}
      <line
        x1="11" y1="31" x2="24" y2="9"
        stroke="#2D4A3E"
        strokeWidth="1.1"
        strokeLinecap="round"
        opacity="0.28"
      />

      {/* Stem */}
      <path
        d="M11 31 Q14 35 16 36"
        stroke="white"
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />

      {/* AI sparkle — 4-point star, upper-right */}
      <path
        d="M32 7 L32.8 9.2 L35 10 L32.8 10.8 L32 13 L31.2 10.8 L29 10 L31.2 9.2Z"
        fill="white"
        opacity="0.78"
      />
    </svg>
  );
}
