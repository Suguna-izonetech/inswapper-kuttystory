import { useState } from "react";
import {
  MapPin,
  Award,
  BookOpen,
  Calendar,
  ChevronDown,
  Info,
  Sparkles,
  X,
  MousePointerClick
} from "lucide-react";
import { INDIA_MAP_DATA, STATE_BBOXES } from "../data/indiaMapData";

// Complete sales dataset based on completed, paid book orders grouped by shipping state
const STATE_SALES_RECORD: Record<string, { name: string; count: number; rank?: number }> = {
  tn: { name: "Tamil Nadu", count: 312, rank: 1 },
  ka: { name: "Karnataka", count: 204, rank: 2 },
  mh: { name: "Maharashtra", count: 188, rank: 3 },
  rj: { name: "Rajasthan", count: 146, rank: 4 },
  kl: { name: "Kerala", count: 121, rank: 5 },
  tg: { name: "Telangana", count: 88, rank: 6 },
  dl: { name: "Delhi", count: 76, rank: 7 },
  gj: { name: "Gujarat", count: 54, rank: 8 },
  up: { name: "Uttar Pradesh", count: 42, rank: 9 },
  wb: { name: "West Bengal", count: 33, rank: 10 },
  ap: { name: "Andhra Pradesh", count: 29, rank: 11 },
  hr: { name: "Haryana", count: 21, rank: 12 },
  pb: { name: "Punjab", count: 18, rank: 13 },
  mp: { name: "Madhya Pradesh", count: 16, rank: 14 },
  or: { name: "Odisha", count: 15, rank: 15 },
  ga: { name: "Goa", count: 14, rank: 16 },
  as: { name: "Assam", count: 11, rank: 17 },
  br: { name: "Bihar", count: 10, rank: 18 },
  ut: { name: "Uttarakhand", count: 8, rank: 19 },
  ch: { name: "Chandigarh", count: 7, rank: 20 },
  hp: { name: "Himachal Pradesh", count: 6, rank: 21 },
  jh: { name: "Jharkhand", count: 6, rank: 22 },
  py: { name: "Puducherry", count: 4, rank: 23 },
  ct: { name: "Chhattisgarh", count: 4, rank: 24 },
  jk: { name: "Jammu and Kashmir", count: 3, rank: 25 },
  tr: { name: "Tripura", count: 2, rank: 26 },
  ml: { name: "Meghalaya", count: 2, rank: 27 },
  mn: { name: "Manipur", count: 1, rank: 28 },
  // States and Union Territories with 0 books sold in the period
  ar: { name: "Arunachal Pradesh", count: 0 },
  nl: { name: "Nagaland", count: 0 },
  mz: { name: "Mizoram", count: 0 },
  sk: { name: "Sikkim", count: 0 },
  an: { name: "Andaman and Nicobar Islands", count: 0 },
  dn: { name: "Dadra and Nagar Haveli", count: 0 },
  dd: { name: "Daman and Diu", count: 0 },
  ld: { name: "Lakshadweep", count: 0 },
};

interface DonutSegment {
  id: string;
  name: string;
  count: number;
  percentage: number;
  color: string;
}

const DONUT_SEGMENTS: DonutSegment[] = [
  { id: "tn", name: "Tamil Nadu", count: 312, percentage: 24, color: "#C98A84" }, // KuttyStory signature rose
  { id: "ka", name: "Karnataka", count: 204, percentage: 16, color: "#D89B74" }, // Warm terracotta
  { id: "mh", name: "Maharashtra", count: 188, percentage: 15, color: "#C5A059" }, // Warm gold
  { id: "rj", name: "Rajasthan", count: 146, percentage: 11, color: "#8F9E8B" }, // Sage green
  { id: "kl", name: "Kerala", count: 121, percentage: 9, color: "#B8A9C9" }, // Soft lavender
  { id: "OTHER", name: "Other states", count: 313, percentage: 24, color: "#C8BCAC" }, // Warm taupe/sand
];

const TOTAL_BOOKS = 1284;
const DONUT_RADIUS = 75;
const CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS;
const GAP_LENGTH = 3.5;
const AVAILABLE_LENGTH = CIRCUMFERENCE - DONUT_SEGMENTS.length * GAP_LENGTH;

// Continuous, harmonious rose color shading function
function getStateFillColor(count: number): string {
  if (count >= 250) return "#A35C56"; // Deepest rose (Tamil Nadu - 312)
  if (count >= 180) return "#BA6F68"; // Deep warm rose (Karnataka, Maharashtra)
  if (count >= 130) return "#C98A84"; // KuttyStory signature rose (Rajasthan - 146)
  if (count >= 80) return "#D59D97";  // Medium rose (Kerala, Telangana)
  if (count >= 40) return "#E0B0AB";  // Soft rose (Delhi, Gujarat, UP)
  if (count >= 15) return "#EAC4BF";  // Gentle blush rose
  if (count >= 1) return "#F3DCD9";   // Light blush tint
  return "#FAF1EF";                   // 0 books sold: calm warm neutral blush
}

export default function BookSalesMapSection() {
  // No state is active by default on initial page load
  const [selectedStateId, setSelectedStateId] = useState<string | null>(null);
  const [hoveredStateId, setHoveredStateId] = useState<string | null>(null);
  const [hoveredDonutId, setHoveredDonutId] = useState<string | null>(null);
  const [showAllModal, setShowAllModal] = useState<boolean>(false);
  const [timeFilter] = useState<string>("Last 30 days");

  // When pointer leaves the map, return to previously selected state if one was clicked; otherwise neutral
  const activeStateId = (hoveredStateId || selectedStateId)?.toLowerCase() || null;

  // Active state record
  const activeRecord = activeStateId ? STATE_SALES_RECORD[activeStateId] : null;

  const activeLocation = activeStateId
    ? INDIA_MAP_DATA.locations.find(
        (loc) => loc.id.toLowerCase() === activeStateId
      )
    : null;

  const activePercentage =
    activeRecord && activeRecord.count > 0
      ? ((activeRecord.count / TOTAL_BOOKS) * 100).toFixed(1)
      : "0.0";

  // Precomputed bounding box for the standalone state shape
  const stateBBox =
    (activeStateId && STATE_BBOXES[activeStateId]) || {
      minX: 0,
      minY: 0,
      width: 612,
      height: 696,
    };
  const padX = Math.max(stateBBox.width * 0.08, 4);
  const padY = Math.max(stateBBox.height * 0.08, 4);
  const standaloneStrokeWidth = Math.max(stateBBox.width, stateBBox.height) * 0.018;

  // Precompute donut offsets
  let cumulativeOffset = 0;
  const segmentsWithOffsets = DONUT_SEGMENTS.map((seg) => {
    const arcLength = (seg.count / TOTAL_BOOKS) * AVAILABLE_LENGTH;
    const offset = cumulativeOffset;
    cumulativeOffset += arcLength + GAP_LENGTH;
    return {
      ...seg,
      arcLength,
      offset,
    };
  });

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 mb-16">
      {/* Inline styles for animated outline and panel transitions */}
      <style>{`
        @keyframes drawStateOutline {
          0% {
            stroke-dashoffset: 700;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
        @keyframes panelFadeInSlide {
          0% {
            opacity: 0;
            transform: translateY(4px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .state-outline-animated {
          stroke-dasharray: 700;
          stroke-dashoffset: 700;
          animation: drawStateOutline 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .panel-fade-slide {
          animation: panelFadeInSlide 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .state-path-base {
          transition: filter 0.2s ease, stroke 0.2s ease;
          outline: none;
        }
        @media (prefers-reduced-motion: reduce) {
          .state-outline-animated {
            animation: none !important;
            stroke-dasharray: none !important;
            stroke-dashoffset: 0 !important;
          }
          .panel-fade-slide {
            animation: none !important;
            transform: none !important;
          }
        }
      `}</style>

      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAEEED] border border-[#C98A84]/30 text-xs font-semibold tracking-wider uppercase text-[#C98A84]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>FOOT STEPS · SALES REACH</span>
          </div>
          <h2 className="font-editorial-serif text-3xl sm:text-4xl font-bold text-[#2D222A]">
            Where our stories travel
          </h2>
          <p className="text-sm text-[#695B64] max-w-2xl">
            See how many Foot Steps books have found a home in each state.
          </p>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="relative inline-flex items-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#EBE3D9] text-xs font-semibold text-[#2D222A] shadow-xs">
              <Calendar className="w-3.5 h-3.5 text-[#C98A84]" />
              <span>{timeFilter}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#695B64]" />
            </div>
          </div>
        </div>
      </div>

      {/* 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {/* Card 1: BOOKS SOLD */}
        <div className="bg-white rounded-2xl p-6 border border-[#EBE3D9] shadow-xs flex items-center gap-4 transition-all hover:border-[#C98A84]/40 hover:shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-[#FAEEED] flex items-center justify-center text-[#C98A84] shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold tracking-wider uppercase text-[#695B64]">
              BOOKS SOLD
            </div>
            <div className="font-editorial-serif text-3xl font-bold text-[#2D222A] tracking-tight">
              1,284
            </div>
            <div className="text-xs text-[#695B64] mt-0.5">
              Across India · selected period
            </div>
          </div>
        </div>

        {/* Card 2: STATES REACHED */}
        <div className="bg-white rounded-2xl p-6 border border-[#EBE3D9] shadow-xs flex items-center gap-4 transition-all hover:border-[#C98A84]/40 hover:shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-[#FAF5E8] flex items-center justify-center text-[#C5A059] shrink-0">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold tracking-wider uppercase text-[#695B64]">
              STATES REACHED
            </div>
            <div className="font-editorial-serif text-3xl font-bold text-[#2D222A] tracking-tight">
              28 states
            </div>
            <div className="text-xs text-[#695B64] mt-0.5">
              Across India
            </div>
          </div>
        </div>

        {/* Card 3: TOP STATE */}
        <div className="bg-white rounded-2xl p-6 border border-[#EBE3D9] shadow-xs flex items-center gap-4 transition-all hover:border-[#C98A84]/40 hover:shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-[#EEF4ED] flex items-center justify-center text-[#8F9E8B] shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold tracking-wider uppercase text-[#695B64]">
              TOP STATE
            </div>
            <div className="font-editorial-serif text-3xl font-bold text-[#2D222A] tracking-tight">
              Tamil Nadu
            </div>
            <div className="text-xs text-[#695B64] mt-0.5">
              312 books sold
            </div>
          </div>
        </div>
      </div>

      {/* Prominent Book Sales Map Card: 75–80% Map on Left, 20–25% Details Panel on Right */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EBE3D9] shadow-sm mb-8">
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="font-editorial-serif text-2xl sm:text-3xl font-bold text-[#2D222A]">
              Book sales by state
            </h3>
            <p className="text-xs sm:text-sm text-[#695B64] mt-1">
              Hover or tap a state to see its book sales.
            </p>
          </div>

          {/* Interactive badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#EBE3D9] text-xs text-[#695B64] self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-[#C98A84] animate-pulse"></span>
            <span>Interactive Map</span>
          </div>
        </div>

        {/* Proportional Layout: 75-80% Full Map & 20-25% Details Panel */}
        {/* On mobile: stacked vertically with full map first */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Full India Map Column (Recognizable, normal scale, no distortion or zoom on map) */}
          <div className="lg:col-span-9 flex flex-col items-center">
            <div
              className="w-full relative bg-[#FAF7F2]/90 rounded-2xl p-4 sm:p-6 border border-[#EBE3D9] flex flex-col items-center justify-center overflow-hidden"
              onMouseLeave={() => setHoveredStateId(null)}
            >
              <div className="w-full max-w-[620px] max-h-[620px] aspect-[612/696] flex items-center justify-center relative">
                <svg
                  viewBox={INDIA_MAP_DATA.viewBox}
                  className="w-full h-full select-none"
                  role="img"
                  aria-label="Interactive India State Book Sales Map"
                  onMouseLeave={() => setHoveredStateId(null)}
                >
                  {/* Full India Map State Paths */}
                  {INDIA_MAP_DATA.locations.map((loc) => {
                    const idLower = loc.id.toLowerCase();
                    const stateInfo = STATE_SALES_RECORD[idLower] || {
                      name: loc.name,
                      count: 0,
                    };
                    const isSelected = selectedStateId ? selectedStateId === idLower : false;
                    const isHovered = hoveredStateId ? hoveredStateId === idLower : false;
                    const isHighlighted = isHovered || isSelected;

                    return (
                      <path
                        key={loc.id}
                        id={`state-${loc.id}`}
                        d={loc.path}
                        fill={getStateFillColor(stateInfo.count)}
                        stroke={isHighlighted ? "#873E38" : "#E5D8D5"}
                        strokeWidth={isHighlighted ? 2.2 : 0.7}
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        tabIndex={0}
                        role="button"
                        aria-label={`${stateInfo.name}: ${stateInfo.count} books sold`}
                        className="state-path-base cursor-pointer focus:stroke-[#873E38] focus:stroke-[2px]"
                        style={{
                          filter: isHighlighted
                            ? "drop-shadow(0 0 4px rgba(135, 62, 56, 0.4)) brightness(1.04)"
                            : undefined,
                        }}
                        onMouseEnter={() => setHoveredStateId(idLower)}
                        onClick={() => setSelectedStateId(idLower)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setSelectedStateId(idLower);
                          }
                        }}
                      />
                    );
                  })}

                  {/* Clear contrasting animated outline for active state on the full map */}
                  {activeLocation && (
                    <path
                      key={`outline-${activeLocation.id}`}
                      d={activeLocation.path}
                      fill="none"
                      stroke="#873E38"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="pointer-events-none state-outline-animated"
                      style={{
                        filter: "drop-shadow(0 0 3px rgba(135, 62, 56, 0.5))",
                      }}
                    />
                  )}
                </svg>
              </div>

              {/* Color Legend below the full map */}
              <div className="mt-5 pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#695B64] border-t border-[#EBE3D9]/80 w-full">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-[#2D222A]">Fewer books</span>
                  <div className="w-36 sm:w-48 h-3 rounded-full bg-gradient-to-r from-[#FAF1EF] via-[#EAC4BF] to-[#A35C56] border border-[#EBE3D9] shadow-inner"></div>
                  <span className="font-medium text-[#2D222A]">More books</span>
                </div>
                <div className="text-[11px] text-[#8C7A86] italic">
                  Shaded by sales volume per state
                </div>
              </div>
            </div>
          </div>

          {/* Details Panel Column (Contains Standalone State Shape + Sales Metrics) */}
          <div className="lg:col-span-3 w-full">
            <div className="bg-[#FAF7F2] rounded-2xl p-4 sm:p-5 border border-[#EBE3D9] shadow-2xs">
              {/* Content transitions smoothly on state change */}
              <div key={activeStateId || "neutral"} className="panel-fade-slide space-y-3.5">
                {!activeRecord || !activeLocation ? (
                  <div className="flex flex-col justify-between min-h-[350px] py-1">
                    {/* Header row: date range + neutral indicator */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-semibold text-[#C98A84] bg-white px-2.5 py-0.5 rounded-full border border-[#C98A84]/20 shadow-2xs">
                        {timeFilter}
                      </span>
                      <span className="text-[10px] font-medium text-[#8C7A86] bg-white px-2 py-0.5 rounded-full border border-[#EBE3D9]">
                        28 States
                      </span>
                    </div>

                    {/* Neutral prompt & icon */}
                    <div className="flex flex-col items-center justify-center text-center my-auto py-8 px-2 space-y-3">
                      <div className="w-13 h-13 rounded-2xl bg-[#FAEEED] border border-[#C98A84]/30 flex items-center justify-center text-[#C98A84] shadow-xs">
                        <MapPin className="w-6 h-6" />
                      </div>
                      <div className="space-y-1.5 max-w-[210px]">
                        <h4 className="font-editorial-serif text-lg sm:text-xl font-bold text-[#2D222A]">
                          State Details
                        </h4>
                        <p className="text-xs sm:text-[13px] text-[#695B64] leading-relaxed">
                          Hover over or select a state to view its details.
                        </p>
                      </div>
                    </div>

                    {/* Short helper hint */}
                    <div className="pt-3 border-t border-[#EBE3D9] flex items-center justify-center gap-1.5 text-[11px] text-[#8C7A86]">
                      <MousePointerClick className="w-3.5 h-3.5 text-[#C98A84] shrink-0" />
                      <span>Hover over or tap any state</span>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Header row: date range + rank */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-semibold text-[#C98A84] bg-white px-2.5 py-0.5 rounded-full border border-[#C98A84]/20 shadow-2xs">
                        {timeFilter}
                      </span>
                      {activeRecord.rank && activeRecord.count > 0 ? (
                        <span className="text-[10px] font-bold text-[#2D222A] bg-white px-2 py-0.5 rounded-full border border-[#EBE3D9]">
                          Rank #{activeRecord.rank}
                        </span>
                      ) : null}
                    </div>

                    {/* Standalone State Shape (Clean vector shape, no magnifying lens, frame or circle) */}
                    <div className="w-full flex items-center justify-center py-2">
                      <div className="w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center relative">
                        <svg
                          viewBox={`${stateBBox.minX - padX} ${stateBBox.minY - padY} ${stateBBox.width + 2 * padX} ${stateBBox.height + 2 * padY}`}
                          className="w-full h-full select-none"
                          style={{
                            filter: "drop-shadow(0 4px 12px rgba(163, 92, 86, 0.28))",
                          }}
                          role="img"
                          aria-label={`Standalone shape of ${activeRecord.name}`}
                        >
                          <path
                            d={activeLocation.path}
                            fill={getStateFillColor(activeRecord.count)}
                            stroke="#873E38"
                            strokeWidth={standaloneStrokeWidth}
                            strokeLinejoin="round"
                            strokeLinecap="round"
                            className="transition-all duration-300"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Selected State Name */}
                    <div className="text-center sm:text-left">
                      <div className="text-[10px] font-medium tracking-wider uppercase text-[#8C7A86]">
                        Selected State
                      </div>
                      <h4 className="font-editorial-serif text-xl sm:text-2xl font-bold text-[#2D222A] leading-tight">
                        {activeRecord.name}
                      </h4>
                    </div>

                    {/* Books Sold Metric */}
                    <div className="bg-white rounded-xl p-3 border border-[#EBE3D9] shadow-2xs">
                      <div className="text-[10px] font-semibold text-[#8C7A86] uppercase tracking-wide">
                        Books Sold
                      </div>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="font-editorial-serif text-2xl sm:text-3xl font-bold text-[#2D222A] leading-none">
                          {activeRecord.count}
                        </span>
                        <span className="text-xs text-[#695B64] font-medium">
                          {activeRecord.count === 0 ? "books sold" : "books"}
                        </span>
                      </div>
                      {activeRecord.count === 0 ? (
                        <p className="text-[10px] text-[#8C7A86] pt-1 italic">
                          0 qualifying orders in selected period.
                        </p>
                      ) : null}
                    </div>

                    {/* Share of Total Sales */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#695B64] text-[11px] font-medium">Share of Total</span>
                        <span className="font-bold text-[#2D222A] text-xs">{activePercentage}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#EBE3D9] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#C98A84] rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.max(
                                activeRecord.count > 0 ? (activeRecord.count / 312) * 100 : 0,
                                activeRecord.count > 0 ? 2 : 0
                              )
                            )}%`,
                          }}
                        />
                      </div>
                      <div className="text-[10px] text-[#8C7A86] text-right">
                        {activeRecord.count} of 1,284 total
                      </div>
                    </div>

                    {/* Short hint */}
                    <div className="pt-2 border-t border-[#EBE3D9] flex items-center gap-1.5 text-[11px] text-[#695B64] leading-snug">
                      <MousePointerClick className="w-3.5 h-3.5 text-[#C98A84] shrink-0" />
                      <span>Tap or click another state to compare totals.</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top States Donut Chart & Analytics Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EBE3D9] shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Donut Chart Visual */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="flex items-center justify-between w-full mb-2">
              <div>
                <h3 className="font-editorial-serif text-xl sm:text-2xl font-bold text-[#2D222A]">
                  Top states
                </h3>
                <p className="text-xs text-[#695B64]">
                  Share of books sold · by state
                </p>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#C98A84] bg-[#FAEEED] px-2.5 py-1 rounded-full border border-[#C98A84]/30">
                SAMPLE DATA
              </span>
            </div>

            <div className="relative w-48 h-48 sm:w-56 sm:h-56 mx-auto my-3 flex items-center justify-center">
              <svg
                viewBox="0 0 220 220"
                className="w-full h-full transform -rotate-90 select-none"
              >
                {/* Background track circle */}
                <circle
                  cx="110"
                  cy="110"
                  r={DONUT_RADIUS}
                  fill="none"
                  stroke="#F7F3EC"
                  strokeWidth="16"
                />

                {/* Donut Segments */}
                {segmentsWithOffsets.map((seg) => {
                  const isHovered = hoveredDonutId === seg.id;
                  const isSelectedOnMap = activeStateId ? activeStateId === seg.id.toLowerCase() : false;
                  return (
                    <circle
                      key={seg.id}
                      cx="110"
                      cy="110"
                      r={DONUT_RADIUS}
                      fill="none"
                      stroke={seg.color}
                      strokeWidth={isHovered || isSelectedOnMap ? 24 : 18}
                      strokeDasharray={`${seg.arcLength} ${CIRCUMFERENCE - seg.arcLength}`}
                      strokeDashoffset={-seg.offset}
                      strokeLinecap="butt"
                      className="transition-all duration-300 cursor-pointer origin-center"
                      style={{
                        filter:
                          isHovered || isSelectedOnMap
                            ? "drop-shadow(0px 2px 6px rgba(45, 34, 42, 0.15))"
                            : "none",
                      }}
                      onClick={() => {
                        if (seg.id === "OTHER") {
                          setShowAllModal(true);
                        } else {
                          setSelectedStateId(seg.id.toLowerCase());
                        }
                      }}
                      onMouseEnter={() => setHoveredDonutId(seg.id)}
                      onMouseLeave={() => setHoveredDonutId(null)}
                    />
                  );
                })}
              </svg>

              {/* Center Text: Total and Books Sold */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none text-center">
                <span className="font-editorial-serif text-3xl sm:text-4xl font-bold text-[#2D222A] tracking-tight leading-none">
                  1,284
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#695B64] mt-1">
                  books sold
                </span>
              </div>
            </div>
          </div>

          {/* Legend and Notes */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
            {/* Color-Coded Legend */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DONUT_SEGMENTS.map((seg) => {
                const isHovered = hoveredDonutId === seg.id;
                const isSelectedOnMap = activeStateId ? activeStateId === seg.id.toLowerCase() : false;
                return (
                  <button
                    key={seg.id}
                    onClick={() => {
                      if (seg.id === "OTHER") {
                        setShowAllModal(true);
                      } else {
                        setSelectedStateId(seg.id.toLowerCase());
                      }
                    }}
                    onMouseEnter={() => setHoveredDonutId(seg.id)}
                    onMouseLeave={() => setHoveredDonutId(null)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all duration-150 cursor-pointer ${
                      isHovered || isSelectedOnMap
                        ? "bg-[#FAEEED]/70 border border-[#C98A84]/40 shadow-2xs"
                        : "hover:bg-[#FAF7F2] border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
                        style={{ backgroundColor: seg.color }}
                      />
                      <span className="text-xs font-semibold text-[#2D222A] truncate">
                        {seg.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="font-editorial-serif text-xs font-bold text-[#2D222A]">
                        {seg.count}
                      </span>
                      <span className="text-[10px] text-[#695B64] font-medium bg-[#FAF7F2] border border-[#EBE3D9] px-2 py-0.5 rounded-md min-w-[38px] text-center">
                        {seg.percentage}%
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* View all link & Explanatory disclaimer */}
            <div className="pt-2 flex items-center justify-between border-t border-[#EBE3D9]">
              <div className="text-[11px] text-[#695B64] leading-relaxed max-w-lg">
                Totals count completed, paid book orders grouped by shipping state, excluding refunds and cancelled orders.
              </div>
              <button
                onClick={() => setShowAllModal(true)}
                className="text-xs font-semibold text-[#C98A84] hover:text-[#B87A74] flex items-center gap-1 transition-colors cursor-pointer group shrink-0 ml-4"
              >
                <span>View all 28 states</span>
                <span className="transition-transform group-hover:translate-x-0.5">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* "View all" Modal for all active reached states */}
      {showAllModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-hidden border border-[#EBE3D9] shadow-2xl flex flex-col">
            <div className="p-6 border-b border-[#EBE3D9] flex items-center justify-between">
              <div>
                <h4 className="font-editorial-serif text-xl font-bold text-[#2D222A]">
                  All States & Territories (28 Reached)
                </h4>
                <p className="text-xs text-[#695B64]">
                  Book orders by shipping state (Last 30 days)
                </p>
              </div>
              <button
                onClick={() => setShowAllModal(false)}
                className="w-8 h-8 rounded-full bg-[#FAF7F2] hover:bg-[#FAEEED] text-[#2D222A] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {Object.entries(STATE_SALES_RECORD)
                  .filter(([, s]) => s.count > 0)
                  .sort(([, a], [, b]) => b.count - a.count)
                  .map(([id, state]) => (
                    <div
                      key={id}
                      onClick={() => {
                        setSelectedStateId(id);
                        setShowAllModal(false);
                      }}
                      className="p-3 rounded-xl border border-[#EBE3D9] bg-[#FAF7F2] hover:bg-[#FAEEED]/40 hover:border-[#C98A84] flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-bold text-[#695B64] w-5">
                          #{state.rank}
                        </span>
                        <span className="text-xs font-semibold text-[#2D222A]">
                          {state.name}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-[#C98A84]">
                        {state.count} books
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="p-4 bg-[#FAF7F2] border-t border-[#EBE3D9] flex items-center justify-between text-xs text-[#695B64]">
              <span>Excludes refunded and cancelled orders</span>
              <button
                onClick={() => setShowAllModal(false)}
                className="px-4 py-1.5 rounded-full bg-[#2D222A] text-white text-xs font-semibold hover:bg-black transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
