import { useState } from "react";
import { Icon } from "./Icon";
import { tables } from "@/algebra";
import { exampleGroups } from "@/utils/constants";

function Sidebar({
  load,
  active,
}: {
  load: (source: string) => void;
  active: string;
}) {
  const [collapsed, setCollapsed] = useState<string[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <aside
      className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}
      aria-label="Banco de dados e exemplos">
      <button
        className="sidebar-toggle"
        type="button"
        aria-expanded={mobileOpen}
        aria-controls="sidebar-content"
        onClick={() => setMobileOpen(!mobileOpen)}>
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
                      open
                        ? [...collapsed, name]
                        : collapsed.filter((item) => item !== name),
                    )
                  }>
                  <Icon
                    name="chevron"
                    className={open ? "chevron" : "chevron closed"}
                  />
                  <Icon name="table" className="accent" />
                  <span>{name}</span>
                </button>
                <ul
                  className="relations-fields"
                  id={`schema-${name}`}
                  hidden={!open}>
                  {table.fields.map(([field, type, key]) => (
                    <li key={field}>
                      <span className={key === "primary" ? "accent" : "muted"}>
                        {key && (
                          <>
                            <Icon name={key === "primary" ? "key" : "link"} />
                            <span className="sr-only">
                              {key === "primary"
                                ? "Chave primária"
                                : "Chave estrangeira"}
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
                      }}>
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

export {
  Sidebar
}
