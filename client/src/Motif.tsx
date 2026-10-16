import type { MotifKind } from "./data";

function Frame() {
  return (
    <g fill="none" stroke="currentColor" strokeWidth="1.4" opacity="0.55">
      <path d="M28 34 H74 M28 34 V80" />
      <path d="M612 34 H566 M612 34 V80" />
      <path d="M28 366 H74 M28 366 V320" />
      <path d="M612 366 H566 M612 366 V320" />
    </g>
  );
}

function Dim({
  x1,
  x2,
  y,
  label,
}: {
  x1: number;
  x2: number;
  y: number;
  label: string;
}) {
  const mid = (x1 + x2) / 2;
  return (
    <g className="dim" stroke="#d83a16" fill="#d83a16">
      <line x1={x1} y1={y} x2={x2} y2={y} strokeWidth="1.2" />
      <path d={`M${x1} ${y - 5} L${x1 - 4} ${y} L${x1} ${y + 5}`} fill="none" />
      <path d={`M${x2} ${y - 5} L${x2 + 4} ${y} L${x2} ${y + 5}`} fill="none" />
      <text x={mid} y={y - 8} textAnchor="middle" stroke="none">
        {label}
      </text>
    </g>
  );
}

function Art({ kind }: { kind: MotifKind }) {
  switch (kind) {
    case "caliper":
      return (
        <g fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M90 150 H520" />
          <path d="M90 168 H520" />
          <path d="M110 150 V280 H210" />
          <path d="M250 168 V270 H190" />
          <rect x="228" y="132" width="86" height="52" />
          <circle cx="300" cy="210" r="28" />
          <path d="M300 182 V238 M272 210 H328" />
          <Dim x1={190} x2={250} y={310} label="0.02" />
        </g>
      );
    case "armor":
      return (
        <g fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M250 90 H390 L430 150 V250 H210 V150 Z" />
          <circle cx="250" cy="168" r="16" />
          <circle cx="390" cy="168" r="16" />
          <path d="M250 168 H390" strokeDasharray="4 4" />
          <path d="M300 150 V250" />
          <path d="M270 250 L250 320 H330 L310 250" />
          <Dim x1={210} x2={430} y={348} label="铰链距" />
        </g>
      );
    case "blade":
      return (
        <g fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M150 280 C220 250 250 120 470 80 C400 140 360 200 300 230 C250 250 190 250 150 280 Z" />
          <path d="M230 230 C280 180 340 130 430 100" strokeDasharray="5 4" />
          <path d="M200 250 C250 210 300 170 390 130" strokeDasharray="5 4" />
          <path d="M300 80 V300" stroke="#d83a16" />
          <Dim x1={180} x2={420} y={330} label="3:1" />
        </g>
      );
    case "track":
      return (
        <g fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M120 230 H500" />
          <path d="M150 200 H470 V150 H190 L150 200 Z" />
          <circle cx="190" cy="230" r="26" />
          <circle cx="280" cy="230" r="18" />
          <circle cx="350" cy="230" r="18" />
          <circle cx="450" cy="230" r="26" />
          <path d="M400 150 L470 110 H500" />
          <Dim x1={164} x2={476} y={300} label="模块 ×14" />
        </g>
      );
    case "escapement":
      return (
        <g fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="300" cy="230" r="70" />
          <path d="M300 160 V300 M230 230 H370 M255 185 L345 275 M255 275 L345 185" />
          <path d="M250 120 H360 L340 150 H300 L250 120 Z" />
          <circle cx="300" cy="230" r="8" fill="currentColor" stroke="none" />
          <Dim x1={230} x2={370} y={340} label="节拍 1.2s" />
        </g>
      );
    case "press":
      return (
        <g fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="230" cy="150" r="46" />
          <circle cx="258" cy="132" r="6" fill="#d83a16" stroke="none" />
          <path d="M258 132 L360 210" />
          <rect x="330" y="196" width="70" height="36" />
          <path d="M150 250 H490" />
          <path d="M150 262 H490" />
          <Dim x1={330} x2={430} y={290} label="行程 48" />
        </g>
      );
    case "hull":
      return (
        <g fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M120 230 H470 L520 180 V130 H160 L120 180 Z" />
          <path d="M200 180 V130 M280 180 V130 M360 180 V130" />
          <circle cx="430" cy="155" r="16" />
          <path d="M120 230 V270 H470" />
          <Dim x1={160} x2={470} y={310} label="接口环" />
        </g>
      );
    case "linkage":
      return (
        <g fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M160 250 H300" />
          <path d="M300 250 L420 140" />
          <circle cx="160" cy="250" r="14" />
          <circle cx="300" cy="250" r="18" />
          <circle cx="420" cy="140" r="14" />
          <path d="M300 250 V320" stroke="#d83a16" />
          <path d="M286 300 H314" stroke="#d83a16" />
          <Dim x1={300} x2={430} y={300} label="0–120°" />
        </g>
      );
  }
}

export function Motif({ kind }: { kind: MotifKind }) {
  return (
    <svg className="motif" viewBox="0 0 640 400" aria-hidden="true">
      <Frame />
      <Art kind={kind} />
    </svg>
  );
}
