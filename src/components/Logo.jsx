export default function Logo({ size = 36, showText = false, className = '' }) {
  if (showText) {
    return (
      <svg
        width={size * 3.2}
        height={size}
        viewBox="0 0 384 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`select-none ${className}`}
      >
        <rect x="22" y="46" width="76" height="54" rx="10" fill="#DC2626" />
        <rect x="22" y="46" width="76" height="16" rx="10" fill="#EF4444" />
        <rect x="22" y="56" width="76" height="6" fill="#EF4444" />
        <path
          d="M36 46V36C36 22.745 46.745 12 60 12C73.255 12 84 22.745 84 36V46"
          stroke="#991B1B"
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="60" cy="76" r="7" fill="#FCA5A5" />
        <rect x="57" y="80" width="6" height="12" rx="3" fill="#FCA5A5" />
        <text x="118" y="82" fontFamily="Inter, system-ui, sans-serif" fontWeight="800" fontSize="52" fill="white">Store</text>
        <text x="270" y="82" fontFamily="Inter, system-ui, sans-serif" fontWeight="800" fontSize="52" fill="#F87171">Ops</text>
      </svg>
    )
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none ${className}`}
    >
      <rect x="22" y="46" width="76" height="54" rx="10" fill="#DC2626" />
      <rect x="22" y="46" width="76" height="16" rx="10" fill="#EF4444" />
      <rect x="22" y="56" width="76" height="6" fill="#EF4444" />
      <path
        d="M36 46V36C36 22.745 46.745 12 60 12C73.255 12 84 22.745 84 36V46"
        stroke="#991B1B"
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="60" cy="76" r="7" fill="#FCA5A5" />
      <rect x="57" y="80" width="6" height="12" rx="3" fill="#FCA5A5" />
    </svg>
  )
}
