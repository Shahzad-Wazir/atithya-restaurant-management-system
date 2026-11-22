export default function AtithyaLogo({
  variant = "full", // "full" | "mark" | "stacked"
  theme = "light",  // "light" (dark brown text) | "dark" (ivory/white text)
  size = "md",      // "sm" | "md" | "lg"
}) {
  const iconDim = size === "sm" ? "w-9 h-9" : size === "lg" ? "w-14 h-14" : "w-11 h-11";
  const titleClass =
    size === "sm"
      ? "text-xl tracking-[0.18em]"
      : size === "lg"
      ? "text-3xl tracking-[0.22em]"
      : "text-2xl tracking-[0.2em]";
  const subClass = size === "sm" ? "text-[8px]" : size === "lg" ? "text-[11px]" : "text-[9px]";
  const textColor = theme === "dark" ? "text-white" : "text-brown";
  const subColor = theme === "dark" ? "text-gold" : "text-primary-dark";

  const Emblem = (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      className={`${iconDim} shrink-0 drop-shadow-sm`}
      aria-label="Atithya Emblem"
    >
      <defs>
        <linearGradient id="atithyaChampagneGrad" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#E6C97A" />
          <stop offset="55%" stopColor="#C49A45" />
          <stop offset="100%" stopColor="#9A742A" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="#17120F" />
      <rect
        x="2.5"
        y="2.5"
        width="59"
        height="59"
        rx="13.5"
        stroke="url(#atithyaChampagneGrad)"
        strokeWidth="1.4"
        strokeOpacity="0.6"
      />
      {/* Sacred lotus hospitality flame */}
      <path d="M32 10C29.5 15 28.5 18.5 32 22C35.5 18.5 34.5 15 32 10Z" fill="url(#atithyaChampagneGrad)" />
      <path
        d="M32 22C26.5 19.5 22 21 20.5 25.5C24.5 26 28.5 25 32 22Z"
        fill="url(#atithyaChampagneGrad)"
        fillOpacity="0.88"
      />
      <path
        d="M32 22C37.5 19.5 42 21 43.5 25.5C39.5 26 35.5 25 32 22Z"
        fill="url(#atithyaChampagneGrad)"
        fillOpacity="0.88"
      />
      {/* Fine-dining cloche dome */}
      <path
        d="M14 43C14 33.059 22.059 25 32 25C41.941 25 50 33.059 50 43H14Z"
        stroke="url(#atithyaChampagneGrad)"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M21 38C22.5 33.5 26.8 30.5 32 30.5"
        stroke="#F7F2E9"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeOpacity="0.7"
      />
      {/* Platter base */}
      <path d="M10 47.5H54" stroke="url(#atithyaChampagneGrad)" strokeWidth="2.8" strokeLinecap="round" />
      <path d="M20 52.5H44" stroke="#B94E2D" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );

  if (variant === "mark") return Emblem;

  if (variant === "stacked") {
    return (
      <div className="inline-flex flex-col items-center gap-2 select-none">
        {Emblem}
        <div className="text-center leading-none">
          <div className={`font-serif font-bold ${titleClass} ${textColor}`}>ATITHYA</div>
          <div className={`uppercase font-semibold tracking-[0.26em] mt-1 ${subClass} ${subColor}`}>
            Fine Dining &amp; Hospitality
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-3 select-none">
      {Emblem}
      <div className="leading-none">
        <div className={`font-serif font-bold ${titleClass} ${textColor}`}>ATITHYA</div>
        <div className={`uppercase font-semibold tracking-[0.24em] mt-1 ${subClass} ${subColor}`}>
          Fine Dining &amp; Hospitality
        </div>
      </div>
    </div>
  );
}
