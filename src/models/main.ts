const Binance = require("node-binance-api");

const binance = new Binance().options({
  APIKEY: "<key>",
  APISECRET: "<secret>",
});
var pilha: any = [];
async function inserirNaPilha() {
  function inserirNaPilha(value: any) {
    pilha.push(value);
    // console.log(pilha.length);
  }
  binance.websockets.bookTickers(inserirNaPilha);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function removerDaPilha() {
  while (true) {
    if (pilha.length > 0) {
      console.log("total na pilha: ", pilha.length);
      pilha.shift();
      console.log("agora tem: ", pilha.length);
    } else await new Promise((resolve) => setTimeout(resolve, 0));
  }
}
function main() {
  Promise.all([inserirNaPilha(), removerDaPilha()]);
}

main();
