import { ReactNode } from "react";

type IconName = "logo" | "plus" | "play" | "chevron" | "table" | "key" | "link" | "note" | "arrow";

function Icon({ name, className }: { name: IconName; className?: string }) {
  if (name === "logo")
    return (
      <svg className={className} aria-hidden="true" viewBox="0 0 36 36" fill="none">
        <path
          d="M4.6 18.1 18 24.3 31.4 18.1v-2.5M4.6 25.1 18 31.5l13.4-6.4v-2.7M4.6 11.3 18 4.9l13.4 6.4L18 17.7 4.6 11.3Z"
          stroke="#ff783d"
          strokeWidth="5.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  const paths: Record<Exclude<IconName, "logo">, ReactNode> = {
    plus: <path d="M8 3v10M3 8h10" />,
    play: <path d="M5 2.8 12.4 8 5 13.2Z" />,
    chevron: <path d="m6 4 4 4-4 4" />,
    table: (
      <>
        <rect x="2" y="2.8" width="12" height="10.4" rx="1" />
        <path d="M2 6.2h12M6 6.2v7" />
      </>
    ),
    key: (
      <>
        <circle cx="5.4" cy="5.4" r="2.5" />
        <path d="m7.2 7.2 5.9 5.9m-1.9-1.9 1.4-1.4m-3.3-.5 1.4-1.4" />
      </>
    ),
    link: (
      <>
        <path d="m6.7 10.9-.9.9a2.3 2.3 0 0 1-3.3-3.3l2.3-2.3a2.3 2.3 0 0 1 3.3 0" />
        <path d="m9.3 5.1.9-.9a2.3 2.3 0 0 1 3.3 3.3l-2.3 2.3a2.3 2.3 0 0 1-3.3 0M6.4 9.6l3.2-3.2" />
      </>
    ),
    note: (
      <>
        <rect x="4" y="1.7" width="8" height="12.6" rx=".4" />
        <path d="M6 5h4M6 7.8h4M6 10.6h2" />
      </>
    ),
    arrow: <path d="M2.8 8h10.1M8.5 3.8 12.9 8l-4.4 4.2" />,
  };
  return (
    <svg
      className={className}
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.55"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

export {
  Icon,
  type IconName
}