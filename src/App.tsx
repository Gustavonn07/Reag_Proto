import { useEffect, useRef, useState, type ReactNode } from "react";
import { evaluate, examples, position, QueryError, tables } from "./algebra";
import { Icon } from "./components/Icon";
import { codeTokens } from "./components/Tokens";
import { Run } from "./types/run";
import { Tab } from "./types/Tab";
import { Sidebar } from "./components/Sidebar";
import { operators, tabs } from "./utils/constants";
import { Help } from "./components/Help";
import { EditorHighlight } from "./components/EditorHighlights";
import { ResultContent } from "./components/ResultContent";

export default function App() {
  const [source, setSource] = useState("");
  const [file, setFile] = useState(1);
  const [caret, setCaret] = useState(0);
  const [tab, setTab] = useState<Tab>("Resultado");
  const [run, setRun] = useState<Run>({ phase: "idle" });
  const [help, setHelp] = useState(false);
  const editor = useRef<HTMLTextAreaElement>(null);
  const highlight = useRef<HTMLPreElement>(null);
  const lineNumbers = useRef<HTMLDivElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const canRun = source.trim().length > 0 && run.phase !== "loading";
  const issue = run.phase === "error" ? run.issue : undefined;
  const { line, column } = position(source, issue?.offset ?? caret);
  const issueLabel = issue ? `Linha ${line}, coluna ${column}: ${issue.message}` : "";

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function syncScroll() {
    const input = editor.current;
    if (input && highlight.current && lineNumbers.current) {
      highlight.current.scrollTop = input.scrollTop;
      highlight.current.scrollLeft = input.scrollLeft;
      lineNumbers.current.scrollTop = input.scrollTop;
    }
  }

  function focusAt(offset: number) {
    requestAnimationFrame(() => {
      editor.current?.focus();
      editor.current?.setSelectionRange(offset, offset);
      syncScroll();
    });
  }

  function load(value: string) {
    window.clearTimeout(timer.current);
    setHelp(false);
    setRun({ phase: "idle" });
    setTab("Resultado");
    setSource(value);
    setCaret(value.length);
    focusAt(value.length);
  }

  function insert(symbol: string) {
    const start = editor.current?.selectionStart ?? source.length;
    const end = editor.current?.selectionEnd ?? start;
    const text = symbol === "(" || symbol === ")" ? symbol : `${symbol} `;
    const next = source.slice(0, start) + text + source.slice(end);
    if (next.length > 4000) return;
    setSource(next);
    setRun({ phase: "idle" });
    if (issue) setTab("Resultado");
    setCaret(start + text.length);
    focusAt(start + text.length);
  }

  function execute() {
    if (!canRun) return;
    setHelp(false);
    setTab("Resultado");
    setRun({ phase: "loading" });
    timer.current = window.setTimeout(() => {
      const start = performance.now();
      try {
        const result = evaluate(source);
        setRun({ phase: "done", result, ms: performance.now() - start });
      } catch (error) {
        setRun({
          phase: "error",
          issue:
            error instanceof QueryError
              ? error
              : new QueryError(
                  "Expressão / consulta não executada",
                  "não foi possível interpretar a expressão",
                  "Verifique a sintaxe ou experimente uma consulta menor.",
                  0,
                ),
        });
        setTab("Erros");
      }
    }, 550);
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        event.preventDefault();
        execute();
      }
      if (event.key === "Escape" && help) setHelp(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const heading = help
    ? "Um guia para sair da abstração."
    : issue
      ? "Errar também faz parte da descoberta."
      : source.trim()
        ? "Da expressão aos dados."
        : "Sua próxima descoberta começa aqui.";
  const editorStatus = issue
    ? "1 problema encontrado"
    : run.phase === "loading"
      ? "Executando no sandbox…"
      : run.phase === "done"
        ? "Expressão válida"
        : source.trim()
          ? "Pronto para executar"
          : "Pronto para começar";
  const outputStatus = {
    idle: "Aguardando consulta",
    loading: "Processando",
    done: "Execução concluída",
    error: "Consulta com erro",
  }[run.phase];
  const records = run.phase === "done" ? run.result.rows.length : 0;

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <Icon name="logo" />
          <span>
            Re<span>Alg</span>Lia.
          </span>
        </div>
        <div className="top-actions">
          <button
            type="button"
            className="top-button new-button"
            onClick={() => {
              setFile((id) => id + 1);
              load("");
            }}
          >
            <Icon name="plus" />
            Novo
          </button>
          <button
            type="button"
            className="top-button execute-button"
            onClick={execute}
            disabled={!canRun}
          >
            {run.phase === "loading" ? <span className="spinner" /> : <Icon name="play" />}
            {run.phase === "loading" ? "Executando" : "Executar"}
          </button>
          <button
            type="button"
            className="top-button help-button"
            aria-pressed={help}
            onClick={() => setHelp(!help)}
          >
            {help ? "Voltar" : "Ajuda"}
          </button>
        </div>
      </header>
      <div className="app-body">
        <Sidebar load={load} active={source} />
        <main className="workspace">
          <div className="workspace-intro">
            <p className="micro accent">Área de estudo</p>
            <div className="workspace-title">
              <h1>{heading}</h1>
              <span className="filename mono small">
                consulta_{String(file).padStart(2, "0")}.alg
              </span>
            </div>
          </div>
          {help ? (
            <Help load={load} />
          ) : (
            <>
              <section
                className={`panel editor-panel phase-${run.phase}`}
                aria-labelledby="editor-title"
              >
                <div className="panel-head">
                  <h2 id="editor-title">Álgebra relacional</h2>
                  <span className="micro">Editor / .alg</span>
                </div>
                <div
                  className="operator-bar"
                  role="group"
                  aria-label="Operadores de álgebra relacional"
                >
                  <div className="operator-buttons">
                    {operators.map(([symbol, label]) => (
                      <button
                        type="button"
                        className="operator"
                        aria-label={label}
                        title={label}
                        key={symbol}
                        disabled={run.phase === "loading"}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => insert(symbol)}
                      >
                        {symbol}
                      </button>
                    ))}
                  </div>
                  <span className="mono small muted">Insira um operador na posição do cursor</span>
                </div>
                <div className={`editor-surface ${issue ? "with-issue" : ""}`}>
                  <div className="editor-viewport">
                    <div className="line-numbers" aria-hidden="true" ref={lineNumbers}>
                      {source.split("\n").map((_, i) => (
                        <div key={i}>{i + 1}</div>
                      ))}
                    </div>
                    <pre className="editor-highlight" aria-hidden="true" ref={highlight}>
                      <EditorHighlight source={source} issue={issue} />
                      {"\n"}
                    </pre>
                    <textarea
                      ref={editor}
                      className="editor-input"
                      aria-labelledby="editor-title"
                      aria-invalid={Boolean(issue)}
                      aria-describedby={issue ? "editor-issue" : undefined}
                      wrap="off"
                      spellCheck={false}
                      autoCapitalize="off"
                      autoCorrect="off"
                      value={source}
                      maxLength={4000}
                      placeholder="Escreva sua expressão ou escolha um exemplo…"
                      readOnly={run.phase === "loading"}
                      onChange={(event) => {
                        setSource(event.target.value);
                        setCaret(event.target.selectionStart);
                        if (issue) setTab("Resultado");
                        setRun({ phase: "idle" });
                      }}
                      onSelect={(event) => setCaret(event.currentTarget.selectionStart)}
                      onScroll={syncScroll}
                    />
                  </div>
                  {issue && (
                    <div className="inline-issue mono small" id="editor-issue">
                      {issueLabel}
                    </div>
                  )}
                </div>
                <div className="panel-foot editor-foot mono small">
                  <span className="state-color">{editorStatus}</span>
                  <span>
                    Ln {line}, Col {column}
                  </span>
                </div>
              </section>
              <section
                className={`panel output-panel phase-${run.phase}`}
                aria-label="Saída da consulta"
              >
                <div className="panel-head output-head">
                  <div
                    className="tabs"
                    role="tablist"
                    aria-label="Saída da consulta"
                    onKeyDown={(event) => {
                      const index = tabs.indexOf(tab);
                      const next =
                        event.key === "ArrowRight"
                          ? (index + 1) % tabs.length
                          : event.key === "ArrowLeft"
                            ? (index + tabs.length - 1) % tabs.length
                            : event.key === "Home"
                              ? 0
                              : event.key === "End"
                                ? tabs.length - 1
                                : -1;
                      if (next >= 0) {
                        event.preventDefault();
                        setTab(tabs[next]);
                        event.currentTarget.querySelectorAll("button")[next].focus();
                      }
                    }}
                  >
                    {tabs.map((item, index) => (
                      <button
                        type="button"
                        role="tab"
                        aria-selected={tab === item}
                        tabIndex={tab === item ? 0 : -1}
                        id={`saida-tab-${index}`}
                        aria-controls="saida-panel"
                        key={item}
                        onClick={() => setTab(item)}
                        className={item === "Erros" && issue ? "error-tab" : undefined}
                      >
                        {item}
                        {item === "Erros" && issue ? " (1)" : ""}
                      </button>
                    ))}
                  </div>
                  <span className="micro state-color output-status" role="status">
                    {outputStatus}
                  </span>
                </div>
                <div
                  className="output-body"
                  id="saida-panel"
                  role="tabpanel"
                  aria-labelledby={`saida-tab-${tabs.indexOf(tab)}`}
                  tabIndex={0}
                >
                  <ResultContent run={run} tab={tab} source={source.trim()} load={load} />
                </div>
                <div className="panel-foot output-foot mono small">
                  <span>
                    {run.phase === "done"
                      ? `${records} ${records === 1 ? "registro retornado" : "registros retornados"} · ${run.ms < 1 ? "< 1" : Math.round(run.ms)} ms`
                      : run.phase === "loading"
                        ? "Executando consulta…"
                        : run.phase === "error"
                          ? "Consulta não executada"
                          : "Nenhuma consulta executada"}
                  </span>
                  <span>Banco interno · sem configuração</span>
                </div>
              </section>
            </>
          )}
          <p className="workspace-foot mono">Ctrl + Enter para executar</p>
        </main>
      </div>
    </div>
  );
}
