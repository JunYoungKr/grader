import type { SVGProps } from "react";
const paths = {
  leaf: "M20 4C9 2 3 7 5 14c3 7 13 4 15-10ZM5 20 16 9",
  search: "m21 21-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0",
  bookmark: "M6 3h12v18l-6-4-6 4V3Z",
  arrow: "M4 12h16m-6-6 6 6-6 6",
  check: "m5 12 4 4L19 6",
  kitchen: "M3 9h18v11H3V9Zm2-5h14M7 12v5m5-8v11m4-8v5",
  basket: "M3 9h18l-2 11H5L3 9Zm4 0 3-6m7 6-3-6M9 13v3m6-3v3",
  fridge: "M6 2h12v20H6V2Zm0 8h12M9 5v2m0 6v3",
  sparkles:
    "m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Zm7 0v4m-2-2h4",
  laundry:
    "M4 3h16v18H4V3Zm0 5h16M7 5h1m3 0h1M16 14a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
  home: "m3 10 9-7 9 7M5 9v12h14V9M9 21v-7h6v7",
  close: "m6 6 12 12M6 18 18 6",
  menu: "M4 6h16M4 12h16M4 18h16",
  ruler: "m3 16 13-13 5 5L8 21l-5-5Zm5-5 3 3m0-6 3 3m0-6 3 3",
  heart:
    "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z",
  sun: "M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
  moon: "M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10Z",
  clock: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM12 7v5l3 2",
} as const;
export type IconName = keyof typeof paths;
export function Icon({
  name,
  size = 20,
  ...props
}: SVGProps<SVGSVGElement> & { name: IconName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d={paths[name]} />
    </svg>
  );
}
