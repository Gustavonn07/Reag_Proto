import { evaluate, QueryError } from "@/algebra";

type Run =
  | { phase: "idle" | "loading" }
  | { phase: "done"; result: ReturnType<typeof evaluate>; ms: number }
  | { phase: "error"; issue: QueryError };

export {
  type Run
}