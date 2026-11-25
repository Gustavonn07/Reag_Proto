import { ReactNode } from "react";

function codeTokens(value: string, sql = false, base = 0) {
  const tokens = sql
    ? /('(?:[^']|'')*')|\b(SELECT|DISTINCT|FROM|WHERE|AND|AS|UNION|EXCEPT)\b/g
    : /('(?:[^']|'')*'|"(?:[^"]|"")*")|[σπ∪−]/g;
  let end = 0;
  const parts: ReactNode[] = [];
  for (const match of value.matchAll(tokens)) {
    const start = match.index;
    parts.push(value.slice(end, start));
    parts.push(
      <span className={match[1] ? undefined : "accent"} key={base + start}>
        {match[0]}
      </span>,
    );
    end = start + match[0].length;
  }
  parts.push(value.slice(end));
  return parts;
}

export {
  codeTokens
}