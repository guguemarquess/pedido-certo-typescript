// =====================================================================
// PEDIDO CERTO · VERSÃO 0 (JavaScript puro, o "ANTES")
// =====================================================================
// Gerado com IA (Claude) a pedido do aluno, com BUGS PLANTADOS de
// propósito. Nas próximas etapas, o TypeScript vai encontrar cada um.
//
//   BUG A  status escrito com letra maiúscula ("Pago" em vez de "pago")
//   BUG B  campo com o nome errado (item.nome, mas o campo é "produto")
//   BUG C  um status esquecido no switch (falta "cancelado")
//   BUG D  dado da "API" com número em forma de texto (frete "12.5")
//   BUG E  pedido sem cliente (null), que quebra o resumo
//
// Para rodar: node legado/pedidos.js
// =====================================================================

// ---------- Frete por região (em reais) ----------
const fretePorRegiao = { sul: 7.85, sudeste: 7.85, centroOeste: 12.5, norte: 20.83, nordeste: 15.98 };

// ---------- Regra 1: criar um pedido (todo pedido nasce "pendente") ----------
function criarPedido(id, cliente, itens, regiao, cupom) {
  return { id, cliente, itens, frete: fretePorRegiao[regiao], cupom, status: "pendente" };
}

// ---------- Regra 2: total = itens − desconto + frete (nunca negativo) ----------
function calcularTotal(pedido) {
  let subtotal = 0;
  for (const item of pedido.itens) {
    subtotal += item.precoUnitario * item.quantidade;
  }
  const desconto = pedido.cupom ? subtotal * (pedido.cupom.percentual / 100) : 0;
  const total = subtotal - desconto + pedido.frete;
  return total < 0 ? 0 : total;
}

// ---------- Regra 3: mudar o status ----------
// pendente → pago → enviado → entregue · cancelar só antes de "enviado"
function pagar(pedido) {
  if (pedido.status !== "pendente") return "Só é possível pagar um pedido pendente";
  pedido.status = "Pago"; // BUG A: maiúscula! O resto do código espera "pago"
  return "Pagamento registrado";
}

function enviar(pedido) {
  if (pedido.status !== "pago") return "Só é possível enviar um pedido pago";
  pedido.status = "enviado";
  return "Pedido enviado";
}

function entregar(pedido) {
  if (pedido.status !== "enviado") return "Só é possível entregar um pedido enviado";
  pedido.status = "entregue";
  return "Pedido entregue";
}

function cancelar(pedido) {
  if (pedido.status === "enviado" || pedido.status === "entregue") {
    return "Não é possível cancelar um pedido que já saiu para entrega";
  }
  pedido.status = "cancelado";
  return "Pedido cancelado";
}

function rotuloStatus(status) {
  switch (status) {
    case "pendente":
      return "aguardando pagamento";
    case "pago":
      return "pago";
    case "enviado":
      return "a caminho";
    case "entregue":
      return "entregue";
    // BUG C: faltou o caso "cancelado"
  }
}

// ---------- Regra 4: pedido que chega "da API" (aqui, um texto JSON simulado) ----------
function lerPedidoDaApi(json) {
  return JSON.parse(json); // confia cegamente no que chegou
}

// ---------- Regra 5: guardar e buscar pedidos ----------
const pedidosSalvos = [];

function salvar(pedido) {
  pedidosSalvos.push(pedido);
}

function buscarPorId(id) {
  return pedidosSalvos.find((pedido) => pedido.id === id);
}

// ---------- Textos para o console ----------
function emReais(valor) {
  return "R$ " + Math.round(valor * 100) / 100;
}

function listarItens(pedido) {
  return pedido.itens.map((item) => item.nome + " x" + item.quantidade).join(", "); // BUG B: o campo se chama "produto"
}

function resumo(pedido) {
  return "#" + pedido.id + " · " + pedido.cliente.nome + " · " + listarItens(pedido) +
    " · total " + emReais(calcularTotal(pedido)) + " · " + rotuloStatus(pedido.status);
}

// =====================================================================
// RODANDO
// =====================================================================
const ana = { nome: "Ana", email: "ana@email.com" };
const camisetas = [{ produto: "Camiseta", precoUnitario: 49.9, quantidade: 2 }];
const pedido1 = criarPedido(1, ana, camisetas, "sul", { codigo: "BEMVINDO10", percentual: 10 });
salvar(pedido1);

console.log("1)", resumo(pedido1));
console.log("2)", pagar(pedido1));
console.log("3)", enviar(pedido1)); //           BUG A aparece aqui
console.log("4)", resumo(pedido1));
console.log("5)", cancelar(pedido1));
console.log("6)", resumo(buscarPorId(1))); //    BUG C aparece aqui

const pedido2 = lerPedidoDaApi(
  '{"id":2,"cliente":{"nome":"Bia"},"itens":[{"produto":"Caneca","precoUnitario":30,"quantidade":1}],"frete":"12.5","status":"pendente"}'
);
salvar(pedido2);
console.log("7)", resumo(pedido2)); //           BUG D aparece aqui

const pedido3 = criarPedido(3, null, [{ produto: "Boné", precoUnitario: 39.9, quantidade: 1 }], "norte");
salvar(pedido3);
console.log("8)", resumo(pedido3)); //           BUG E: o programa quebra aqui
