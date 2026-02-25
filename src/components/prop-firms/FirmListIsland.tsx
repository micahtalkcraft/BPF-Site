import { useState, useMemo } from "react";

export interface FirmItem {
  id: string;
  slug: string;
  name: string;
  status: string;
  rank: number;
  evaluationTypes: string[];
  maxDrawdown: number | null;
  dailyDrawdown: number | null;
  splitMax: number | null;
  platforms: string[];
  lowestFee: number | null;
  overallScore?: number;
  trustpilotRating?: number | null;
  tags?: string[];
  discountCode?: string;
  discountPercent?: number;
  logoUrl?: string;
  website?: string;
  hasReview?: boolean;
  foundedYear?: number;
  hqCountry?: string;
  flagDataUri?: string;
  flagged?: boolean;
  isAwardWinner?: boolean;
  isBrokerBacked?: boolean;
}

const SORT_OPTIONS = [
  { value: "score-desc", label: "Score: High to Low" },
  { value: "score-asc", label: "Score: Low to High" },
  { value: "payout-desc", label: "Payout Split: High" },
  { value: "name-asc", label: "Name: A–Z" },
];

const EVAL_FILTERS = [
  { value: "all", label: "All Types" },
  { value: "1-step", label: "1-Step" },
  { value: "2-step", label: "2-Step" },
  { value: "instant", label: "Instant" },
  { value: "other", label: "Futures" },
  { value: "broker-backed", label: "Broker Backed" },
];

function scoreColor(score: number): string {
  if (score >= 88) return "bg-green-500";
  if (score >= 82) return "bg-green-400";
  if (score >= 76) return "bg-lime-500";
  if (score >= 70) return "bg-yellow-400";
  if (score >= 62) return "bg-amber-500";
  return "bg-red-500";
}

function ScorePill({ score }: { score: number }) {
  return (
    <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl ${scoreColor(score)} shadow flex-shrink-0`}>
      <span className="text-base font-black text-white leading-none">{score}</span>
      <span className="text-[8px] text-white/70 font-medium leading-none mt-0.5">/100</span>
    </div>
  );
}

function FirmAvatar({ name, logoUrl }: { name: string; logoUrl?: string }) {
  const [imgError, setImgError] = useState(false);

  if (logoUrl && !imgError) {
    return (
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center overflow-hidden shadow-sm">
        <img
          src={logoUrl}
          alt={`${name} logo`}
          className="w-full h-full object-contain p-1"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const colors = [
    "bg-teal-500", "bg-blue-500", "bg-violet-500",
    "bg-indigo-500", "bg-teal-500", "bg-sky-500",
  ];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${color} flex items-center justify-center border border-slate-200`}>
      <span className="text-sm font-black text-white">{initials}</span>
    </div>
  );
}

function VerifiedBadge() {
  return (
    <span className="relative group/verified flex-shrink-0">
      <svg className="h-[18px] w-[18px] text-[#1d9bf0]" viewBox="0 0 22 22" fill="currentColor" aria-label="Verified">
        <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.855-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.69-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.607-.274 1.264-.144 1.897.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681.132-.637.075-1.299-.165-1.903.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"/>
      </svg>
      <span className="pointer-events-none absolute top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-[11px] font-semibold text-white opacity-0 group-hover/verified:opacity-100 transition-opacity duration-150 shadow-lg z-10">
        Verified
        <span className="absolute -top-1 left-1/2 -translate-x-1/2 h-2 w-2 rotate-45 bg-gray-900"></span>
      </span>
    </span>
  );
}

function CautionBadge() {
  return (
    <span className="relative group/caution flex-shrink-0">
      <svg className="h-[18px] w-[18px] text-red-500" viewBox="0 0 24 24" fill="currentColor" aria-label="Caution">
        <path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99zM11 16h2v2h-2zm0-6h2v4h-2z"/>
      </svg>
      <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-[11px] font-semibold text-white opacity-0 group-hover/caution:opacity-100 transition-opacity duration-150 shadow-lg z-10">
        Caution
      </span>
    </span>
  );
}

function TrophyIcon() {
  return (
    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
      <path d="M5 3h14v2h-1v1a7.014 7.014 0 01-3.088 5.803A4.5 4.5 0 0113 15.46V18h2a1 1 0 011 1v2H8v-2a1 1 0 011-1h2v-2.54a4.5 4.5 0 01-1.912-3.657A7.014 7.014 0 016 6V5H5V3zm14 2h-1.5a5 5 0 001.119 3.143A5.49 5.49 0 0019 5zM5 5a5.49 5.49 0 00.381 3.143A5 5 0 006.5 5H5z"/>
    </svg>
  );
}

function MedalIcon() {
  return (
    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2l2.4 3.6H18l-1.2 4.2L20 13l-3.6 1.2L15 18l-3-2.4L9 18l-1.4-3.8L4 13l3.2-3.2L6 5.6h3.6L12 2z"/>
    </svg>
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-amber-900 px-2.5 py-0.5 rounded-md shadow-sm shadow-amber-400/30 border border-amber-400/40">
        <TrophyIcon />
        #1 Ranked
      </span>
    );
  }
  if (rank === 2) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-slate-300 via-slate-200 to-slate-300 text-slate-700 px-2.5 py-0.5 rounded-md shadow-sm shadow-slate-300/30 border border-slate-300/50">
        <MedalIcon />
        #2 Ranked
      </span>
    );
  }
  if (rank === 3) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 text-amber-100 px-2.5 py-0.5 rounded-md shadow-sm shadow-amber-700/30 border border-amber-600/40">
        <MedalIcon />
        #3 Ranked
      </span>
    );
  }
  return null;
}

function AwardBadge() {
  return (
    <span className="relative group/award flex-shrink-0">
      <span className="inline-flex items-center justify-center h-[18px] w-[18px] rounded-full bg-gradient-to-br from-amber-400 via-yellow-300 to-amber-500 shadow-sm shadow-amber-400/40">
        <svg className="h-2.5 w-2.5 text-amber-900" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"/>
        </svg>
      </span>
      <span className="pointer-events-none absolute top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gradient-to-r from-amber-500 to-amber-600 px-2.5 py-1 text-[10px] font-bold text-white opacity-0 group-hover/award:opacity-100 transition-opacity duration-150 shadow-lg z-10">
        2026 Award Winner
        <span className="absolute -top-1 left-1/2 -translate-x-1/2 h-2 w-2 rotate-45 bg-amber-500"></span>
      </span>
    </span>
  );
}

function CountryFlag({ dataUri, code }: { dataUri: string; code: string }) {
  return (
    <img
      src={dataUri}
      alt={code}
      className="inline-block w-5 h-3.5 rounded-[2px] shadow-sm border border-slate-200/60 flex-shrink-0"
      loading="lazy"
    />
  );
}

function CouponBlock({ code, percent }: { code: string; percent?: number }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <div className="w-24 flex-shrink-0 flex flex-col items-center justify-center rounded-xl border border-dashed border-orange-300 bg-orange-50 px-3 py-2 text-center gap-1">
      {percent !== undefined && (
        <span className="text-sm font-black text-orange-600 leading-none">{percent}% OFF</span>
      )}
      <button
        onClick={handleCopy}
        className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-700 hover:text-orange-900 transition-colors"
        title="Click to copy code"
      >
        <svg className="h-2.5 w-2.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        {copied ? "Copied!" : code}
      </button>
    </div>
  );
}

const ITEMS_PER_PAGE = 10;

export default function FirmListIsland({ firms, basePath = "" }: { firms: FirmItem[]; basePath?: string }) {
  const [search, setSearch] = useState("");
  const [evalFilter, setEvalFilter] = useState("all");
  const [sort, setSort] = useState("score-desc");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let list = [...firms];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((f) => f.name.toLowerCase().includes(q));
    }

    if (evalFilter === "broker-backed") {
      list = list.filter((f) => f.isBrokerBacked);
    } else if (evalFilter !== "all") {
      list = list.filter((f) => f.evaluationTypes.includes(evalFilter));
    }

    list.sort((a, b) => {
      if (sort === "score-desc") return (b.overallScore ?? 0) - (a.overallScore ?? 0);
      if (sort === "score-asc") return (a.overallScore ?? 0) - (b.overallScore ?? 0);
      if (sort === "payout-desc") return (b.splitMax ?? 0) - (a.splitMax ?? 0);
      if (sort === "name-asc") return a.name.localeCompare(b.name);
      return 0;
    });

    return list;
  }, [firms, search, evalFilter, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginatedFirms = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  // Reset to page 1 when filters change
  const handleFilterChange = (val: string) => { setEvalFilter(val); setPage(1); };
  const handleSearch = (val: string) => { setSearch(val); setPage(1); };
  const handleSort = (val: string) => { setSort(val); setPage(1); };

  return (
    <div>
      {/* Search + controls */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 mb-6">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 18a7.5 7.5 0 006.15-3.35z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search prop firms..."
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => handleSort(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer font-medium text-slate-700"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none"
              fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Eval type filter chips */}
        <div className="flex flex-wrap gap-2 mt-3">
          {EVAL_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => handleFilterChange(f.value)}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                evalFilter === f.value
                  ? "bg-teal-500 border-teal-500 text-white shadow-sm"
                  : "bg-white border-slate-200 text-slate-600 hover:border-teal-300 hover:text-teal-600"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      <p className="text-sm text-slate-500 mb-4">
        Showing <span className="font-semibold text-slate-800">{(safePage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(safePage * ITEMS_PER_PAGE, filtered.length)}</span> of <span className="font-semibold text-slate-800">{filtered.length}</span> prop firm{filtered.length !== 1 ? "s" : ""}
      </p>

      {/* Firm list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <svg className="mx-auto h-10 w-10 mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="font-medium">No firms match your filters</p>
          </div>
        ) : (
          paginatedFirms.map((firm) => (
            <div
              key={firm.id}
              className="relative group bg-white border border-slate-200 rounded-xl px-6 py-5 shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-200 overflow-hidden"
            >
              {/* Left accent bar */}
              <span className="absolute left-0 top-4 bottom-4 w-0.5 rounded-r bg-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

              <div className="flex items-center gap-4">
                {/* Rank */}
                <span className="hidden sm:block flex-shrink-0 text-2xl font-black text-slate-200 w-8 text-center select-none">
                  {String(firm.rank).padStart(2, "0")}
                </span>

                {/* Avatar / Logo */}
                <FirmAvatar name={firm.name} logoUrl={firm.logoUrl ? `${basePath}${firm.logoUrl}` : undefined} />

                {/* Name + subtitle + tags */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <a
                      href={`${basePath}/reviews/${firm.slug}`}
                      className="text-lg font-extrabold text-slate-900 hover:text-teal-600 transition-colors"
                    >
                      {firm.name}
                    </a>
                    {firm.flagged ? <CautionBadge /> : firm.hasReview && <VerifiedBadge />}
                    {firm.isAwardWinner && <AwardBadge />}
                    <RankBadge rank={firm.rank} />
                    {firm.status !== "active" && (
                      <span className="text-[10px] font-bold uppercase tracking-wide bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
                        {firm.status}
                      </span>
                    )}
                  </div>
                  {/* Subtitle: Est. YEAR · FLAG COUNTRY */}
                  {(firm.foundedYear || firm.hqCountry) && (
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                      {firm.foundedYear && <span>Est. {firm.foundedYear}</span>}
                      {firm.foundedYear && firm.hqCountry && <span>·</span>}
                      {firm.hqCountry && (
                        <span className="inline-flex items-center gap-1">
                          {firm.flagDataUri && <CountryFlag dataUri={firm.flagDataUri} code={firm.hqCountry} />}
                          {firm.hqCountry}
                        </span>
                      )}
                    </p>
                  )}
                  {/* Tags row */}
                  <div className="flex items-center gap-1.5 mt-1.5 overflow-hidden">
                    {firm.evaluationTypes.map((t) => (
                      <span key={t} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium capitalize whitespace-nowrap flex-shrink-0">
                        {t === "other" ? "Futures" : t}
                      </span>
                    ))}
                    {(firm.tags ?? []).slice(0, 3).map((tag) => (
                      <span key={tag} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium whitespace-nowrap flex-shrink-0">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="hidden md:flex items-center gap-5 text-sm">
                  <div className="text-center">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide font-medium">Payout</p>
                    <p className={`font-bold text-sm ${firm.splitMax ? "text-teal-600" : "text-slate-300"}`}>
                      {firm.splitMax ? `${firm.splitMax}%` : "—"}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide font-medium">Max DD</p>
                    <p className="font-bold text-sm text-slate-700">
                      {firm.maxDrawdown ? `${firm.maxDrawdown}%` : "—"}
                    </p>
                  </div>
                  {firm.lowestFee !== null && (
                    <div className="text-center">
                      <p className="text-[10px] text-slate-400 uppercase tracking-wide font-medium">From</p>
                      <p className="font-bold text-sm text-slate-700">${firm.lowestFee}</p>
                    </div>
                  )}
                </div>

                {/* Coupon block — always rendered so columns stay aligned */}
                <div className="hidden sm:flex flex-shrink-0">
                  {firm.discountCode ? (
                    <CouponBlock code={firm.discountCode} percent={firm.discountPercent} />
                  ) : (
                    <div className="w-24 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-2.5 text-center gap-1">
                      <span className="text-sm font-black text-slate-300 leading-none">—</span>
                      <span className="text-[10px] font-medium text-slate-300">No Coupon</span>
                    </div>
                  )}
                </div>

                {/* Score + CTA */}
                <div className="flex items-start gap-3 flex-shrink-0">
                  {firm.overallScore !== undefined ? (
                    <ScorePill score={firm.overallScore} />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] text-slate-400 font-medium text-center leading-tight">No Score</span>
                    </div>
                  )}
                  <div className="hidden sm:flex flex-col gap-1.5">
                    <a
                      href={`${basePath}/reviews/${firm.slug}`}
                      className="inline-flex items-center justify-center gap-1 w-28 rounded-lg bg-teal-500 px-3 py-2.5 text-xs font-semibold text-white hover:bg-teal-600 transition-colors whitespace-nowrap"
                    >
                      Read Review
                      <svg className="h-3 w-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                    {firm.website && (
                      <a
                        href={firm.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1 w-28 text-[10px] text-slate-400 hover:text-teal-600 transition-colors overflow-hidden"
                      >
                        <span className="truncate">Visit {firm.name}</span>
                        <svg className="h-2.5 w-2.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-1.5 mt-8" aria-label="Pagination">
          <button
            onClick={() => { setPage(Math.max(1, safePage - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            disabled={safePage <= 1}
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-teal-300 hover:text-teal-600 transition-colors disabled:opacity-30 disabled:pointer-events-none"
            aria-label="Previous page"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className={`inline-flex items-center justify-center w-9 h-9 rounded-lg text-sm font-semibold border transition-colors ${
                p === safePage
                  ? "bg-teal-500 border-teal-500 text-white shadow-sm"
                  : "bg-white border-slate-200 text-slate-600 hover:border-teal-300 hover:text-teal-600"
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => { setPage(Math.min(totalPages, safePage + 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            disabled={safePage >= totalPages}
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-teal-300 hover:text-teal-600 transition-colors disabled:opacity-30 disabled:pointer-events-none"
            aria-label="Next page"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </nav>
      )}
    </div>
  );
}
