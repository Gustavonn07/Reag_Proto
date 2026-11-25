import { guide } from "@/utils/constants";

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

export {
  Help
}