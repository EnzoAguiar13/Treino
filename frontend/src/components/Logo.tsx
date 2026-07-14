export function Logo({ size = 'md' }: { size?: 'md' | 'lg' }) {
  return (
    <div className="flex items-center gap-2 select-none">
      <span
        className={`grid place-items-center rounded-xl bg-brand font-black text-white ${
          size === 'lg' ? 'h-12 w-12 text-2xl' : 'h-8 w-8 text-base'
        }`}
      >
        E
      </span>
      <span className={`font-bold tracking-tight ${size === 'lg' ? 'text-2xl' : 'text-lg'}`}>
        Esportiva<span className="text-brand">Bet</span>
      </span>
    </div>
  );
}
