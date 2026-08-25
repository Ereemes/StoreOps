export default function Logo({ size = 36, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Shopping bag body */}
      <rect x="20" y="38" width="68" height="62" rx="10" fill="#DC2626" />

      {/* Bag handle */}
      <path
        d="M40 38V28C40 17.507 48.507 9 59 9V9C69.493 9 78 17.507 78 28V38"
        stroke="#991B1B"
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
      />

      {/* White highlight stripe on bag */}
      <rect x="20" y="38" width="68" height="14" rx="10" fill="#EF4444" />
      <rect x="20" y="48" width="68" height="4" fill="#EF4444" />

      {/* Cursor/pointer arrow */}
      <path
        d="M62 58L62 98L76 84L92 88L62 58Z"
        fill="white"
        stroke="#991B1B"
        strokeWidth="3"
        strokeLinejoin="round"
      />

      {/* Small bag detail - vertical line */}
      <line x1="54" y1="62" x2="54" y2="78" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
    </svg>
  )
}
