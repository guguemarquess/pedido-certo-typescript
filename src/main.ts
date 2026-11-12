import { adicionarItens, cancelar, criarPedido, enviar, pagar, resumo, rotuloStatus } from "./regras";
import { RepositorioDePedidos } from "./repositorio";
import type { Cliente } from "./tipos";
import { lerPedidoDaApi } from "./validacao";

const repositorio = new RepositorioDePedidos();

console.log("== 1. Pedido da Ana: cupom de 10%, pago com Pix e enviado ==");
const ana: Cliente = { id: 1, nome: "Ana", email: "ana@email.com" };
let pedidoDaAna = criarPedido(1, ana, [{ produto: "Camiseta", precoUnitario: 49.9, quantidade: 2 }], "sul", {
  tipo: "percentual",
  codigo: "BEMVINDO10",
  percentual: 10,
});
pedidoDaAna = pagar(pedidoDaAna, { tipo: "pix", chave: "ana@email.com" });
pedidoDaAna = enviar(pedidoDaAna);
repositorio.salvar(pedidoDaAna);
console.log(resumo(pedidoDaAna));

console.log("\n== 2. Regra: não dá para cancelar depois do envio ==");
try {
  cancelar(pedidoDaAna);
} catch (erro) {
  // No catch, o erro chega como "unknown": é preciso conferir o que ele é antes de usar.
  console.log("Bloqueado:", erro instanceof Error ? erro.message : erro);
}

console.log("\n== 3. Pedido do Caio: itens adicionados depois, e o frete fica grátis ==");
const caio: Cliente = { id: 3, nome: "Caio", email: "caio@email.com" };
let pedidoDoCaio = criarPedido(3, caio, [{ produto: "Tênis", precoUnitario: 159.9, quantidade: 1 }], "norte", {
  tipo: "valorFixo",
  codigo: "VOLTA20",
  valor: 20,
});
console.log(resumo(pedidoDoCaio));
pedidoDoCaio = adicionarItens(
  pedidoDoCaio,
  { produto: "Meia", precoUnitario: 19.9, quantidade: 2 },
  { produto: "Boné", precoUnitario: 39.9, quantidade: 1 },
);
pedidoDoCaio = pagar(pedidoDoCaio, { tipo: "cartao", final: "4242", parcelas: 3 });
repositorio.salvar(pedidoDoCaio);
console.log(resumo(pedidoDoCaio));

console.log("\n== 4. Pedido de visitante, pago com boleto ==");
const pedidoDeVisitante = pagar(
  criarPedido(4, null, [{ produto: "Caneca", precoUnitario: 35, quantidade: 1 }], "nordeste"),
  { tipo: "boleto", vencimento: "20/11/2026" },
);
repositorio.salvar(pedidoDeVisitante);
console.log(resumo(pedidoDeVisitante));

console.log("\n== 5. Pedido vindo da API (o BUG D ainda passa: corrigido na etapa 3) ==");
const pedidoDaApi = lerPedidoDaApi(
  '{"id":2,"cliente":{"id":2,"nome":"Bia","email":"bia@email.com"},"itens":[{"produto":"Caneca","precoUnitario":30,"quantidade":1}],"regiao":"sudeste","frete":"12.5","status":"pendente"}',
);
repositorio.salvar(pedidoDaApi);
console.log(resumo(pedidoDaApi));

console.log("\n== 6. Repositório ==");
console.log(`Pedidos salvos: ${repositorio.listar().length}`);
// buscarPorId pode não achar nada (Pedido | undefined): o TypeScript obriga a tratar.
const encontrado = repositorio.buscarPorId(1);
console.log(encontrado ? `Pedido 1: ${rotuloStatus(encontrado.status)}` : "Pedido 1 não encontrado");
