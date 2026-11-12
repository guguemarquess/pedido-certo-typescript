// Tabela de frete por região, em reais.
// "as const" congela a tabela: as chaves viram textos exatos e os valores não mudam.
// Ela não é exportada: continua privada a este arquivo. Quem está fora usa Frete.calcular.
const TABELA_DE_FRETE = {
  sul: 7.85,
  sudeste: 7.85,
  centroOeste: 12.5,
  norte: 20.83,
  nordeste: 15.98,
} as const;

// keyof typeof: as regiões válidas SÃO as chaves da tabela. Para atender uma
// região nova, basta acrescentá-la na tabela, e o tipo acompanha sozinho.
// (Na etapa 2, Regiao era uma lista escrita à mão em tipos.ts: duas fontes da mesma verdade.)
export type Regiao = keyof typeof TABELA_DE_FRETE;

// Type guard: confere, em tempo de execução, se um valor qualquer é uma região atendida.
// O retorno "valor is Regiao" avisa o TypeScript: se der true, pode tratar o valor como Regiao.
export function ehRegiao(valor: unknown): valor is Regiao {
  return typeof valor === "string" && Object.hasOwn(TABELA_DE_FRETE, valor);
}

// Classe só com membros static: a regra de frete pertence à loja, e não a um
// pedido específico. Por isso não se cria instância (new): usa-se Frete.calcular(...).
export class Frete {
  // Regra de negócio: frete grátis a partir deste subtotal, em reais.
  static readonly GRATIS_A_PARTIR_DE = 200;

  static calcular(regiao: Regiao, subtotal: number): number {
    return subtotal >= Frete.GRATIS_A_PARTIR_DE ? 0 : TABELA_DE_FRETE[regiao];
  }
}
