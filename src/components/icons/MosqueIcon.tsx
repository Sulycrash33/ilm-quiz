import type { SVGProps } from "react";

export function MosqueIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M2 22h20" />
      <path d="M4 12c-1.5 0-3 1.33-3 4v2h6v-2c0-2.67-1.5-4-3-4Z" />
      <path d="M10 12c-1.5 0-3 1.33-3 4v2h6v-2c0-2.67-1.5-4-3-4Z" />
      <path d="M16 12c-1.5 0-3 1.33-3 4v2h6v-2c0-2.67-1.5-4-3-4Z" />
      <path d="M22 12c-1.5 0-3 1.33-3 4v2h6v-2c0-2.67-1.5-4-3-4Z" />
      <path d="M7 12V8l-3-4" />
      <path d="M13 12V8l-3-4" />
      <path d="M19 12V8l-3-4" />
      <path d="M10 8V2l4 2-4 2" />
    </svg>
  );
}
