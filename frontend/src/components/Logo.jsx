export default function Logo({ size = 44, textClass = '' }) {
  return (
    <div className="flex items-center gap-3">
      <svg width={size} height={size} viewBox="0 0 52 52" fill="none">
        <path d="M26 4C26 4 8 12 8 26C8 35.941 16.059 44 26 44C35.941 44 44 35.941 44 26C44 12 26 4 26 4Z" fill="#1B6AB1" />
        <path d="M26 4C26 4 8 12 8 26C8 35.941 16.059 44 26 44V4Z" fill="#0F3460" />
        <path d="M18 24H23V19C23 18.448 23.448 18 24 18H28C28.552 18 29 18.448 29 19V24H34C34.552 24 35 24.448 35 25V29C35 29.552 34.552 30 34 30H29V35C29 35.552 28.552 36 28 36H24C23.448 36 23 35.552 23 35V30H18C17.448 30 17 29.552 17 29V25C17 24.448 17.448 24 18 24Z" fill="white" />
      </svg>
      <div className="leading-none">
        <span className={`block font-extrabold tracking-tight text-navy ${textClass}`}>PROVER</span>
        <span className={`block font-extrabold tracking-tight text-royal ${textClass}`}>SAÚDE</span>
        <span className="block text-[9px] font-semibold tracking-widest uppercase text-slate-400 mt-1">
          Proteção e Prevenção
        </span>
      </div>
    </div>
  );
}
