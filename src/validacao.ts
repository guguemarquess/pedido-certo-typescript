import { ehRegiao } from "./frete";
import { STATUS_PEDIDO, type Cliente, type ItemPedido, type Pedido, type StatusPedido } from "./tipos";
import { falha, sucesso, type Resultado } from "./utilitarios";

// Decisão: os dados de fora são "unknown" até serem conferidos campo a campo.
// Não uso "any" (desligaria a checagem) nem "as Pedido" (fingiria que está tudo certo).

function ehObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

function ehStatus(valor: unknown): valor is StatusPedido {
  // O "as readonly string[]" só ALARGA o tipo da lista (de textos exatos para
  // texto qualquer), para o includes aceitar um texto que ainda não foi conferido.
  // Não esconde nenhum erro: quem decide é o includes, em tempo de execução.
  return typeof valor === "string" && (STATUS_PEDIDO as readonly string[]).includes(valor);
}

function lerTexto(valor: unknown, campo: string, erros: string[]): string {
  if (typeof valor === "string" && valor.trim() !== "") return valor;
  erros.push(`${campo}: esperava um texto, recebi ${JSON.stringify(valor)}`);
  return "";
}

// Decisão: aceito número em forma de texto ("12.5"), que é comum em APIs, mas
// CONVERTO com Number() e confiro o resultado. É a diferença entre o "as"
// (finge que é número) e o Number() (converte de verdade).
function lerNumero(valor: unknown, campo: string, erros: string[]): number {
  const numero = typeof valor === "string" && valor.trim() !== "" ? Number(valor) : valor;
  if (typeof numero === "number" && Number.isFinite(numero) && numero >= 0) return numero;
  erros.push(`${campo}: esperava um número maior ou igual a zero, recebi ${JSON.stringify(valor)}`);
  return 0;
}

function lerCliente(valor: unknown, erros: string[]): Cliente | null {
  if (valor === null || valor === undefined) return null; // pedido de visitante
  if (!ehObjeto(valor)) {
    erros.push("cliente: esperava um objeto ou null");
    return null;
  }
  return {
    id: lerNumero(valor.id, "cliente.id", erros),
    nome: lerTexto(valor.nome, "cliente.nome", erros),
    email: lerTexto(valor.email, "cliente.email", erros),
  };
}

function lerItens(valor: unknown, erros: string[]): ItemPedido[] {
  if (!Array.isArray(valor) || valor.length === 0) {
    erros.push("itens: esperava uma lista com pelo menos um item");
    return [];
  }
  // Array.isArray devolve uma lista de "any". Por isso cada item é anotado como unknown.
  return valor.map((item: unknown, posicao) => {
    const campo = `itens[${posicao}]`;
    if (!ehObjeto(item)) {
      erros.push(`${campo}: esperava um objeto`);
      return { produto: "", precoUnitario: 0, quantidade: 0 };
    }
    const quantidade = lerNumero(item.quantidade, `${campo}.quantidade`, erros);
    if (quantidade !== 0 && !Number.isInteger(quantidade)) {
      erros.push(`${campo}.quantidade: esperava um número inteiro, recebi ${quantidade}`);
    }
    return {
      produto: lerTexto(item.produto, `${campo}.produto`, erros),
      precoUnitario: lerNumero(item.precoUnitario, `${campo}.precoUnitario`, erros),
      quantidade,
    };
  });
}

// Devolve Resultado<Pedido>: o mesmo "deu certo / deu errado" usado nas regras.
// (Na etapa 3, havia um tipo só para isto, RespostaDaValidacao. O generic acabou com a duplicação.)
export function validarPedido(dado: unknown): Resultado<Pedido> {
  if (!ehObjeto(dado)) return falha("pedido: esperava um objeto");

  // Junta TODOS os problemas antes de responder, em vez de parar no primeiro:
  // quem integra a API corrige tudo de uma vez.
  const erros: string[] = [];
  const id = lerNumero(dado.id, "id", erros);
  const cliente = lerCliente(dado.cliente, erros);
  const itens = lerItens(dado.itens, erros);
  const frete = lerNumero(dado.frete, "frete", erros);

  const regiao = ehRegiao(dado.regiao) ? dado.regiao : undefined;
  if (regiao === undefined) erros.push(`regiao: ${JSON.stringify(dado.regiao)} não é uma região atendida`);

  const status = ehStatus(dado.status) ? dado.status : undefined;
  if (status === undefined) {
    erros.push(`status: ${JSON.stringify(dado.status)} não é um status válido`);
  } else if (status !== "pendente") {
    // Regra de negócio: pedido que chega de fora entra como pendente e segue o fluxo daqui.
    erros.push(`status: pedidos da API entram como "pendente", recebi "${status}"`);
  }

  if (erros.length > 0 || regiao === undefined || status === undefined) return falha(...erros);
  // Decisão: pedidos da API entram sem cupom e sem pagamento. Esses campos só
  // são aplicados aqui dentro, pelas regras de negócio.
  return sucesso({ id, cliente, itens, regiao, frete, status });
}

export function lerPedidoDaApi(json: string): Resultado<Pedido> {
  // O JSON.parse devolve "any". Guardar em uma variável unknown "desarma" o any
  // logo na entrada: daqui para a frente, nada é usado sem conferência.
  let dado: unknown;
  try {
    dado = JSON.parse(json);
  } catch {
    return falha("o texto recebido não é um JSON válido");
  }
  return validarPedido(dado);
}
