type Field = readonly [
  name: string,
  type: "int" | "texto" | "decimal",
  key?: "primary" | "foreign",
];
type Value = string | number;
type Table = { fields: readonly Field[]; rows: Value[][] };

export const tables: Record<string, Table> = {
  estudantes: {
    fields: [
      ["id", "int", "primary"],
      ["nome", "texto"],
      ["curso", "texto"],
      ["nota", "decimal"],
    ],
    rows: [
      [1, "Ana Silva", "Ciência da Computação", 9.2],
      [2, "Lucas Santos", "Sistemas de Informação", 7.8],
      [3, "Mariana Costa", "Ciência da Computação", 6.5],
      [4, "Pedro Lima", "Engenharia de Software", 5.4],
    ],
  },
  disciplinas: {
    fields: [
      ["codigo", "texto", "primary"],
      ["titulo", "texto"],
      ["creditos", "int"],
    ],
    rows: [
      ["BD101", "Banco de Dados", 4],
      ["ALG102", "Algoritmos", 4],
      ["ES103", "Engenharia de Software", 3],
    ],
  },
  matriculas: {
    fields: [
      ["estudante_id", "int", "foreign"],
      ["disciplina_codigo", "texto", "foreign"],
      ["semestre", "texto"],
    ],
    rows: [
      [1, "BD101", "2025.1"],
      [1, "ALG102", "2025.1"],
      [2, "BD101", "2025.1"],
      [3, "ES103", "2025.2"],
      [4, "ALG102", "2025.2"],
    ],
  },
};

export const examples = [
  { symbol: "σ", title: "Filtrar por nota", expression: "σ nota ≥ 7 (estudantes)" },
  { symbol: "π", title: "Escolher colunas", expression: "π nome, curso (estudantes)" },
  {
    symbol: "∪",
    title: "Unir conjuntos",
    expression: "(π nome (σ nota ≥ 7 (estudantes)))\n∪ (π nome (σ nota < 7 (estudantes)))",
  },
  {
    symbol: "π σ",
    title: "Projeção com filtro",
    expression: "π nome, curso (σ nota ≥ 7 (estudantes))",
  },
  {
    symbol: "−",
    title: "Diferença de conjuntos",
    expression: "(π nome (estudantes))\n− (π nome (σ nota ≥ 7 (estudantes)))",
  },
];

type Token = { text: string; offset: number };
type Query =
  | { select: string; from: string; where?: string }
  | { set: string; left: Query; right: Query };
type Relation = Table & { query: Query };

export class QueryError extends Error {
  constructor(
    public category: string,
    message: string,
    public hint: string,
    public offset: number,
    public length = 1,
    public suggestion?: string,
  ) {
    super(message);
  }
}

export function position(source: string, offset: number) {
  const lines = source.slice(0, offset).split("\n");
  return { line: lines.length, column: lines[lines.length - 1].length + 1 };
}

const unique = (rows: Value[][]) => [
  ...new Map(rows.map((row) => [JSON.stringify(row), row])).values(),
];
const indent = (sql: string) =>
  sql
    .split("\n")
    .map((line) => `  ${line}`)
    .join("\n");
const subquery = (query: Query) => `(\n${indent(render(query))}\n) AS consulta`;
const renderSetSide = (query: Query) =>
  "set" in query ? `SELECT *\nFROM ${subquery(query)}` : render(query);

function render(query: Query): string {
  if ("set" in query)
    return `${renderSetSide(query.left)}\n${query.set}\n${renderSetSide(query.right)}`;
  return `SELECT ${query.select}\nFROM ${query.from}${query.where ? `\nWHERE ${query.where}` : ""}`;
}

const comparators: Record<string, string> = {
  "≥": ">=",
  "≤": "<=",
  "≠": "<>",
  "!=": "<>",
  "==": "=",
};
const compare = (operator: string, left: Value, right: Value) => {
  switch (operator) {
    case "=":
      return left === right;
    case "<>":
      return left !== right;
    case ">":
      return left > right;
    case "<":
      return left < right;
    case ">=":
      return left >= right;
    case "<=":
      return left <= right;
    default:
      return false;
  }
};

const isName = (text: string) => /^[a-z_][a-z_0-9]*$/i.test(text);
const isNumber = (text: string) => /^(?:\d+(?:\.\d+)?|\.\d+)$/.test(text);

export function evaluate(source: string) {
  const tokens = [
    ...source.matchAll(
      /\s+|'(?:[^']|'')*'|"(?:[^"]|"")*"|>=|<=|<>|!=|==|\d+(?:\.\d+)?|\.\d+|[a-z_][a-z_0-9]*|./gi,
    ),
  ]
    .filter(([text]) => !/^\s+$/.test(text))
    .map((match) => ({ text: match[0], offset: match.index }));
  let cursor = 0;
  const peek = (): Token => tokens[cursor] ?? { text: "", offset: source.length };
  const take = () => {
    const token = peek();
    cursor++;
    return token;
  };
  const accept = (text: string) => peek().text === text && Boolean(take());
  function syntax(token: Token, message: string, hint: string): never {
    throw new QueryError(
      "Sintaxe / expressão inválida",
      message,
      hint,
      token.offset,
      token.text.length || 1,
    );
  }
  function name() {
    if (!isName(peek().text))
      syntax(peek(), "esperava um nome", "Use um nome de tabela ou coluna do sandbox.");
    return take();
  }
  function group(depth: number) {
    if (depth > 64)
      syntax(peek(), "há muitos níveis de parênteses", "Divida a expressão em consultas menores.");
    if (peek().text !== "(")
      syntax(
        peek(),
        "faltou abrir o parêntese",
        "Coloque a relação entre parênteses depois do operador.",
      );
    const open = take();
    const relation = expression(depth);
    if (!accept(")")) {
      if (peek().text)
        syntax(
          peek(),
          "esperava fechar o parêntese",
          "Verifique os operadores e feche o grupo com “)”.",
        );
      const { column } = position(source, open.offset);
      throw new QueryError(
        "Sintaxe / parêntese não fechado",
        "faltou fechar o parêntese",
        `Adicione “)” ao final da expressão para fechar o grupo iniciado na coluna ${column}.`,
        open.offset,
        1,
        source.trimEnd() + ")",
      );
    }
    return relation;
  }
  function field(relation: Relation, token: Token) {
    const index = relation.fields.findIndex(([key]) => key === token.text.toLowerCase());
    if (index < 0)
      throw new QueryError(
        "Semântica / coluna não encontrada",
        `a coluna ${token.text} não existe nesta relação`,
        `Colunas disponíveis: ${relation.fields.map(([key]) => key).join(", ")}.`,
        token.offset,
        token.text.length,
      );
    return index;
  }
  function atom(depth: number): Relation {
    const token = peek();
    if (token.text === "(") return group(depth + 1);
    if (accept("π")) {
      const names = [name()];
      while (accept(",")) names.push(name());
      const input = group(depth + 1);
      const indexes = [...new Set(names.map((column) => field(input, column)))];
      const fields = indexes.map((index) => input.fields[index]);
      const select = `DISTINCT ${fields.map(([key]) => key).join(", ")}`;
      return {
        fields,
        rows: unique(input.rows.map((row) => indexes.map((index) => row[index]))),
        query:
          "select" in input.query && input.query.select === "*"
            ? { ...input.query, select }
            : { select, from: subquery(input.query) },
      };
    }
    if (accept("σ")) {
      const column = name();
      const comparison = take();
      const operator = comparators[comparison.text] ?? comparison.text;
      if (!["=", "<>", ">", "<", ">=", "<="].includes(operator)) {
        syntax(
          comparison,
          "esperava um operador de comparação",
          "Use =, ≠, >, <, ≥ ou ≤ depois do nome da coluna.",
        );
      }
      const negative = accept("-") || accept("−");
      const value = take();
      const numeric = isNumber(value.text);
      const quoted = value.text.length >= 2 && /^['"]/.test(value.text);
      if ((negative && !numeric) || (!numeric && !quoted && !isName(value.text))) {
        syntax(
          value,
          "esperava um valor na condição",
          "Use um número, texto entre aspas ou nome de coluna.",
        );
      }
      const input = group(depth + 1);
      const index = field(input, column);
      const other = numeric || quoted ? -1 : field(input, value);
      const literal = numeric
        ? Number(value.text) * (negative ? -1 : 1)
        : value.text.slice(1, -1).split(value.text[0]?.repeat(2)).join(value.text[0]);
      if (numeric && !Number.isFinite(literal))
        syntax(value, "número fora do intervalo", "Use um número menor na condição.");
      const expectsText = input.fields[index][1] === "texto";
      const isText = other < 0 ? quoted : input.fields[other][1] === "texto";
      if (expectsText !== isText)
        throw new QueryError(
          "Semântica / tipos incompatíveis",
          "os valores da comparação têm tipos diferentes",
          "Compare texto com texto, ou número com número.",
          value.offset,
          value.text.length,
        );
      const sqlValue =
        other >= 0
          ? input.fields[other][0]
          : typeof literal === "string"
            ? `'${literal.replace(/'/g, "''")}'`
            : literal;
      const where = `${input.fields[index][0]} ${operator} ${sqlValue}`;
      return {
        fields: input.fields,
        rows: input.rows.filter((row) =>
          compare(operator, row[index], other >= 0 ? row[other] : literal),
        ),
        query:
          "select" in input.query && input.query.select === "*"
            ? {
                ...input.query,
                where: input.query.where ? `${input.query.where} AND ${where}` : where,
              }
            : { select: "*", from: subquery(input.query), where },
      };
    }
    const table = name();
    const key = table.text.toLowerCase();
    if (!Object.hasOwnProperty.call(tables, key)) {
      const similar = Object.keys(tables).find(
        (item) => item.startsWith(key) || key.startsWith(item),
      );
      throw new QueryError(
        "Semântica / tabela não encontrada",
        `a tabela ${table.text} não existe no sandbox`,
        `Verifique o nome da tabela na barra lateral.${similar ? ` Você quis dizer ${similar}?` : ""}`,
        table.offset,
        table.text.length,
        similar
          ? source.slice(0, table.offset) + similar + source.slice(table.offset + table.text.length)
          : undefined,
      );
    }
    return { ...tables[key], query: { select: "*", from: key } };
  }
  function expression(depth = 0): Relation {
    let left = atom(depth);
    while (["∪", "-", "−", "UNION", "EXCEPT"].includes(peek().text.toUpperCase())) {
      const operator = take();
      const isUnion = ["∪", "UNION"].includes(operator.text.toUpperCase());
      const right = atom(depth);
      if (
        left.fields.length !== right.fields.length ||
        left.fields.some((item, i) => (item[1] === "texto") !== (right.fields[i][1] === "texto"))
      ) {
        throw new QueryError(
          "Semântica / relações incompatíveis",
          "as relações têm colunas incompatíveis",
          "Use o mesmo número de colunas, com tipos compatíveis na mesma ordem.",
          operator.offset,
          operator.text.length,
        );
      }
      const rightKeys = new Set(right.rows.map((row) => JSON.stringify(row)));
      left = {
        fields: left.fields,
        rows: isUnion
          ? unique([...left.rows, ...right.rows])
          : unique(left.rows.filter((row) => !rightKeys.has(JSON.stringify(row)))),
        query: { set: isUnion ? "UNION" : "EXCEPT", left: left.query, right: right.query },
      };
    }
    return left;
  }

  const result = expression();
  if (peek().text) {
    if (peek().text === ")")
      syntax(
        peek(),
        "parêntese de fechamento sem abertura",
        "Remova o parêntese extra ou verifique os grupos.",
      );
    syntax(
      peek(),
      `símbolo inesperado: ${peek().text}`,
      "Revise a expressão ou abra a ajuda para ver a sintaxe dos operadores.",
    );
  }
  return {
    columns: result.fields.map(([key]) => key),
    rows: result.rows,
    sql: render(result.query) + ";",
  };
}
