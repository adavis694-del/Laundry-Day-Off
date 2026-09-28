export default function Starburst({ className = "", color = "#E48A96" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true" fill={color}>
      <path d="M50 0 L54 42 L100 50 L54 58 L50 100 L46 58 L0 50 L46 42 Z" />
    </svg>
  );
}
