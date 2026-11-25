import { QueryError } from "@/algebra";
import { codeTokens } from "./Tokens";

function EditorHighlight({ source, issue }: { source: string; issue?: QueryError }) {
  if (!issue) return codeTokens(source);
  const end = issue.offset + issue.length;
  return (
    <>
      {codeTokens(source.slice(0, issue.offset))}
      <span className="error-mark">{source.slice(issue.offset, end) || " "}</span>
      {codeTokens(source.slice(end), false, end)}
    </>
  );
}

export {
  EditorHighlight
}