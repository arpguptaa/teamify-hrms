import logo from '../assets/teamify-logo.png';

const SIZES = {
  sm: { img: 'h-8 w-8', text: 'text-lg' },
  md: { img: 'h-11 w-11', text: 'text-2xl' },
  lg: { img: 'h-16 w-16', text: 'text-3xl' },
};

export default function Logo({ size = 'md', withWordmark = true, className = '' }) {
  const s = SIZES[size] || SIZES.md;
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img src={logo} alt="Teamify" className={`${s.img} rounded-xl object-cover shrink-0`} />
      {withWordmark && (
        <div className="leading-tight">
          <div className={`font-bold tracking-tight brand-gradient-text ${s.text}`}>TEAMIFY</div>
          <div className="text-[11px] tracking-[0.2em] uppercase text-ink-faint dark:text-ink-soft-dark -mt-0.5">
            Connect &amp; Empower
          </div>
        </div>
      )}
    </div>
  );
}
