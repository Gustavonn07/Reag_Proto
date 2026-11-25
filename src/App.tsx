import { useEffect, useRef, useState, type ReactNode } from "react";
import { evaluate, examples, position, QueryError, tables } from "./algebra";

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

const operators = [
  ["σ", "Seleção"],
  ["π", "Projeção"],
  ["∪", "União"],
  ["−", "Diferença"],
  ["(", "Abrir parêntese"],
  [")", "Fechar parêntese"],
];
const guide = [
  {
    operator: "σ",
    title: "Seleção",
    description: "Filtra as linhas que atendem a uma condição.",
    detail: "Use para encontrar estudantes com nota ≥ 7.",
    example: examples[0],
  },
  {
    operator: "π",
    title: "Projeção",
    description: "Escolhe as colunas e remove duplicatas.",
    detail: "Use para mostrar apenas o que importa.",
    example: examples[1],
  },
  {
    operator: "∪",
    title: "União",
    description: "Reúne os registros de duas relações compatíveis.",
    detail: "As duas relações devem ter colunas compatíveis.",
    example: examples[2],
  },
  {
    operator: "−",
    title: "Diferença",
    description: "Retorna os registros que estão só na primeira relação.",
    detail: "A ordem importa: A − B é diferente de B − A.",
    example: examples[4],
  },
];
const exampleGroups = [
  { title: "Básicos", items: examples.slice(0, 3) },
  { title: "Avançados", items: examples.slice(3) },
];

const tabs = ["Resultado", "SQL gerado", "Erros"] as const;
type Tab = (typeof tabs)[number];
type Run =
  | { phase: "idle" | "loading" }
  | { phase: "done"; result: ReturnType<typeof evaluate>; ms: number }
  | { phase: "error"; issue: QueryError };

function Sidebar({ load, active }: { load: (source: string) => void; active: string }) {
  const [collapsed, setCollapsed] = useState<string[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <aside
      className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}
      aria-label="Banco de dados e exemplos"
    >
      <button
        className="sidebar-toggle"
        type="button"
        aria-expanded={mobileOpen}
        aria-controls="sidebar-content"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        <Icon name="table" /> Banco de dados e exemplos <Icon name="chevron" />
      </button>
      <div id="sidebar-content" className="sidebar-content">
        <div className="sidebar-intro">
          <h2 className="micro">Banco de dados</h2>
          <p className="sandbox">
            <span /> Sandbox acadêmico
          </p>
          <p className="mono small muted">3 tabelas · dados de exemplo</p>
        </div>
        <div className="schema">
          {Object.entries(tables).map(([name, table]) => {
            const open = !collapsed.includes(name);
            return (
              <section className="relation" key={name}>
                <button
                  className="relation-toggle"
                  type="button"
                  aria-expanded={open}
                  aria-controls={`schema-${name}`}
                  onClick={() =>
                    setCollapsed(
                      open ? [...collapsed, name] : collapsed.filter((item) => item !== name),
                    )
                  }
                >
                  <Icon name="chevron" className={open ? "chevron" : "chevron closed"} />
                  <Icon name="table" className="accent" />
                  <span>{name}</span>
                </button>
                <ul className="relations-fields" id={`schema-${name}`} hidden={!open}>
                  {table.fields.map(([field, type, key]) => (
                    <li key={field}>
                      <span className={key === "primary" ? "accent" : "muted"}>
                        {key && (
                          <>
                            <Icon name={key === "primary" ? "key" : "link"} />
                            <span className="sr-only">
                              {key === "primary" ? "Chave primária" : "Chave estrangeira"}
                            </span>
                          </>
                        )}
                      </span>
                      <span>{field}</span>
                      <span className="field-type">{type}</span>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
        <div className="sidebar-examples">
          <h2 className="micro">Exemplos</h2>
          {exampleGroups.map(({ title, items }, i) => (
            <section className="example-group" key={title}>
              <h3>
                <Icon className={i === 0 ? "accent" : ""} name="note" />
                {title}
              </h3>
              <ul>
                {items.map(({ symbol, title, expression }) => (
                  <li key={title}>
                    <button
                      type="button"
                      aria-pressed={active === expression}
                      onClick={() => {
                        setMobileOpen(false);
                        load(expression);
                      }}
                    >
                      <span aria-hidden="true">{symbol}</span>
                      {title}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
        <p className="sidebar-version micro">Sandbox local · v1.0</p>
      </div>
    </aside>
  );
}

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

function Help({ load }: { load: (source: string) => void }) {
  return (
    <section className="panel help-panel" aria-labelledby="help-title">
      <h2 id="help-title">Quatro operações. Muitas descobertas.</h2>
      <p>
        Use os símbolos da barra para montar sua expressão. Depois, compare o SQL e o resultado.
      </p>
      <div className="help-grid">
        {guide.map(({ operator, title, description, detail, example }) => (
          <article className="help-card" key={title}>
            <h3>
              <span>{operator}</span>
              {title}
            </h3>
            <p>{description}</p>
            <button
              type="button"
              className="code-example"
              title="Carregar este exemplo"
              onClick={() => load(example.expression)}
            >
              <code>{example.expression}</code>
            </button>
            <p className="help-detail">{detail}</p>
          </article>
        ))}
      </div>
      <div className="help-shortcut">
        <kbd>Ctrl + Enter</kbd>
        <span>Executar consulta</span>
        <code>V1: σ · π · ∪ · − &nbsp;|&nbsp; Use parênteses para agrupar.</code>
      </div>
    </section>
  );
}

function Empty({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="center-state">
      <h3>{title}</h3>
      <p>{description}</p>
      {children}
    </div>
  );
}

function ResultContent({
  run,
  tab,
  source,
  load,
}: {
  run: Run;
  tab: Tab;
  source: string;
  load: (source: string) => void;
}) {
  if (run.phase === "loading")
    return (
      <div className="center-state progress-state" role="status">
        <span className="spinner" aria-hidden="true" />
        <h3>Sua expressão está ganhando forma.</h3>
        <p>Convertendo para SQL e consultando os dados de exemplo.</p>
        <div className="progress-track" aria-hidden="true">
          <span />
        </div>
        <span className="mono small progress-steps">
          01 Validar <Icon name="arrow" /> 02 Converter <Icon name="arrow" /> 03 Consultar
        </span>
      </div>
    );
  if (tab === "Erros" && run.phase === "error") {
    const { issue } = run;
    const { line, column } = position(source, issue.offset);
    return (
      <div className="result-content error-content">
        <div className="error-box" role="alert">
          <p className="micro">{issue.category}</p>
          <h3>
            {issue.category.startsWith("Sintaxe")
              ? `Linha ${line}, coluna ${column}: ${issue.message}`
              : `${issue.message[0].toUpperCase()}${issue.message.slice(1)}.`}
          </h3>
          <p>{issue.hint}</p>
          {issue.suggestion && (
            <button
              type="button"
              className="code-example"
              title="Usar expressão sugerida"
              onClick={() => load(issue.suggestion!)}
            >
              <code>{issue.suggestion}</code>
            </button>
          )}
        </div>
        <p className="result-description">
          O resultado será atualizado depois que a expressão for corrigida e executada.
        </p>
      </div>
    );
  }
  if (tab === "Erros")
    return run.phase === "done" ? (
      <Empty
        title="Nenhum erro encontrado."
        description="Sua expressão é válida e a consulta foi executada."
      />
    ) : (
      <Empty
        title="Nenhuma consulta validada."
        description="Execute uma expressão para verificar possíveis erros."
      />
    );
  if (run.phase === "error")
    return (
      <Empty
        title={tab === "SQL gerado" ? "SQL não gerado." : "Consulta não executada."}
        description="Confira a aba Erros para corrigir a expressão e executar novamente."
      />
    );
  if (run.phase === "done") {
    const { columns, rows, sql } = run.result;
    if (tab === "SQL gerado")
      return (
        <div className="result-content sql-content">
          <p className="micro">SQL equivalente</p>
          <div className="sql-code" aria-label="SQL equivalente">
            <pre>
              <code>
                {sql.split("\n").map((line, index) => (
                  <span className="sql-line" key={index}>
                    <span aria-hidden="true">{index + 1}</span>
                    <span>{codeTokens(line, true)}</span>
                    {"\n"}
                  </span>
                ))}
              </code>
            </pre>
          </div>
          <p className="result-description">
            {source === examples[3].expression
              ? "π escolhe as colunas; σ filtra as linhas. DISTINCT preserva a semântica de conjuntos."
              : "Esta consulta SQL é equivalente à expressão de álgebra relacional executada."}
          </p>
          <p className="mono small muted result-meta">
            Gerado a partir da sua expressão · somente leitura
          </p>
        </div>
      );

    return (
      <div className={`result-content table-content ${rows.length ? "" : "no-rows"}`}>
        <div className="table-wrap">
          <table aria-label="Registros retornados">
            <thead>
              <tr>
                <th className="row-index" scope="col">
                  {rows.length > 0 && "#"}
                </th>
                {columns.map((column) => (
                  <th key={column} scope="col">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index}>
                  <td className="row-index">{index + 1}</td>
                  {row.map((value, i) => (
                    <td key={i}>{value}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length > 0 ? (
          <>
            <p className="result-description">
              {source === examples[3].expression
                ? "Consulta concluída. Estes são os estudantes com nota maior ou igual a 7."
                : "Consulta concluída. Estes são os registros que atendem à sua expressão."}
            </p>
            <p className="mono small muted result-meta">
              {columns.length} {columns.length === 1 ? "coluna" : "colunas"} · {columns.join(", ")}
            </p>
          </>
        ) : (
          <Empty
            title="Nenhum registro por aqui."
            description={
              /nota\s*>\s*10\s*\(/.test(source)
                ? "A consulta é válida, mas nenhum estudante tem nota maior que 10."
                : "A consulta é válida, mas nenhuma linha atende à expressão."
            }
          >
            <button
              className="retry-example"
              type="button"
              onClick={() => load(examples[0].expression)}
            >
              Tente um filtro como {examples[0].expression}.
            </button>
            <span className="mono small muted">
              0 registros · ajuste o filtro e execute novamente
            </span>
          </Empty>
        )}
      </div>
    );
  }
  if (tab === "SQL gerado")
    return (
      <Empty
        title="O SQL da sua consulta aparece aqui."
        description="Escreva uma expressão válida e execute para visualizar a tradução."
      />
    );
  return (
    <div className="center-state welcome-state">
      <span className="welcome-symbol" aria-hidden="true">
        π
      </span>
      <h3>Transforme teoria em resultado.</h3>
      <p>Escreva uma expressão, execute e veja os dados aparecerem aqui.</p>
      <button className="example-cta" type="button" onClick={() => load(examples[3].expression)}>
        Começar com um exemplo <Icon name="arrow" />
      </button>
    </div>
  );
}

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
