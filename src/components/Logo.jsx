export default function Logo({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gld" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EADCC9" />
          <stop offset="50%" stopColor="#D2B795" />
          <stop offset="100%" stopColor="#B89A6A" />
        </linearGradient>
      </defs>
      <polygon points="50,10 90,35 90,65 50,90 10,65 10,35" stroke="url(#gld)" strokeWidth="2" fill="rgba(210,183,149,0.1)" />
      <polygon points="50,22 78,38 78,62 50,78 22,62 22,38" stroke="url(#gld)" strokeWidth="1" fill="rgba(210,183,149,0.06)" />
      <text x="50" y="57" textAnchor="middle" fontFamily="serif" fontSize="22" fontWeight="bold" fill="url(#gld)" letterSpacing="1">CH</text>
    </svg>
  );
}
