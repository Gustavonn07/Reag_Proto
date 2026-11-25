import { Run } from "@/types/run";
import { Tab } from "@/types/Tab";
import { Icon } from "./Icon";
import { examples, position } from "@/algebra";
import { Empty } from "./Empty";
import { codeTokens } from "./Tokens";

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

export {
  ResultContent
}