import { examples } from "@/algebra";

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

export {
  exampleGroups,
  guide,
  operators,
  tabs,
}