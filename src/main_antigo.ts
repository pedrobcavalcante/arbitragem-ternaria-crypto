import { BookTickers } from "./models/bookTickers.model";
import { ExchangeInfo } from "./models/exchangeInfo.model";
import { SymbolValue } from "./models/symbolvalue.model";
var fs = require('fs');

const Binance = require("node-binance-api");

const binance = new Binance().options({
  APIKEY: "<key>",
  APISECRET: "<secret>",
});

let info: ExchangeInfo;
let pares: SymbolValue[] = [];
const lucroMinimo = 0.5;
const taxaPlataforma = 0.1;
const meus_saldos = [
  { symbol: "USDT", quantidade: 100000 },
  { symbol: "ETH", quantidade: 100000 },
  { symbol: "BNB", quantidade: 100000 },
  { symbol: "BRL", quantidade: 100000 },
  { symbol: "BTC", quantidade: 100000 }
]
var logger = fs.createWriteStream('log.txt', {
  flags: 'a' // 'a' means appending (old data will be preserved)
})
async function exchangeInfo() {
  info = await await binance.exchangeInfo();
  console.log("rodando")
}

exchangeInfo()
function bookTickers(value: BookTickers) {
  try {
    for (let symbol of info.symbols) {
      if (symbol.symbol == value.symbol) {
        let symbolValue: SymbolValue = { baseAsset: symbol.baseAsset, baseAssetPrecision: symbol.baseAssetPrecision, baseCommissionPrecision: symbol.baseCommissionPrecision, bestAsk: value.bestAsk, bestAskQty: value.bestAskQty, bestBid: value.bestBid, bestBidQty: value.bestBidQty, filters: symbol.filters, icebergAllowed: symbol.icebergAllowed, isMarginTradingAllowed: symbol.isMarginTradingAllowed, isSpotTradingAllowed: symbol.isSpotTradingAllowed, ocoAllowed: symbol.ocoAllowed, orderTypes: symbol.orderTypes, permissions: symbol.permissions, quoteAsset: symbol.quoteAsset, quoteAssetPrecision: symbol.quoteAssetPrecision, quoteCommissionPrecision: symbol.quoteCommissionPrecision, quoteOrderQtyMarketAllowed: symbol.quoteOrderQtyMarketAllowed, quotePrecision: symbol.quotePrecision, status: symbol.status, symbol: symbol.symbol, updateId: value.updateId };
        if (pares.length == 0) { pares.push(symbolValue); }
        else if (pares.some((element) => element.symbol === symbol.symbol)) {
          pares[pares.findIndex((element) => element.symbol === symbol.symbol)] = symbolValue;
        }
        else { pares.push(symbolValue); }
      }
    }
    verificarCaminho(pares)
  } catch (error) {
  }
}
binance.websockets.bookTickers(bookTickers);


function verificarCaminho(pares: SymbolValue[]) {

  for (let saldo of meus_saldos) {
    for (let paridade1 of pares) {
      if (saldo.symbol === paridade1.quoteAsset) {
        for (let paridade2 of pares) {
          if (paridade1.baseAsset === paridade2.quoteAsset) {
            for (let paridade3 of pares) {
              if (saldo.symbol === paridade3.quoteAsset && paridade2.baseAsset === paridade3.baseAsset) {
                const taxaPlataform = (1 - (taxaPlataforma / 100));
                const saldo1 = saldo.quantidade * taxaPlataform / parseFloat(paridade1.bestAsk);
                const saldo2 = saldo1 * taxaPlataform / parseFloat(paridade2.bestAsk);
                const saldo3 = saldo2 * taxaPlataform * parseFloat(paridade3.bestBid);
                const lucro = ((saldo3 / saldo.quantidade) - 1) * 100

                const res = `${saldo.symbol} -> Compra ${paridade1.symbol} valor ${paridade1.bestAsk} total ${saldo1};-> Compra ${paridade2.symbol} valor ${paridade2.bestAsk} total ${saldo2};-> Vende ${paridade3.symbol} valor ${paridade3.bestBid} total ${saldo3}; lucro: ${lucro.toFixed(2)}%`;

                // const saldoSemTaxa1 = saldo.quantidade / parseFloat(paridade1.bestAsk);
                // const saldoSemTaxa2 = saldoSemTaxa1 / parseFloat(paridade2.bestAsk);
                // const saldoSemTaxa3 = saldoSemTaxa2 * parseFloat(paridade3.bestBid);
                // const lucroSemTaxa = ((saldoSemTaxa3 / saldo.quantidade) - 1) * 100

                // const resSemTaxa = `${saldo.symbol} -> Compra ${paridade1.symbol} valor ${paridade1.bestAsk} total ${saldo1};-> Compra ${paridade2.symbol} valor ${paridade2.bestAsk} total ${saldo2};-> Vende ${paridade3.symbol} valor ${paridade3.bestBid} total ${saldoSemTaxa3}; lucro: ${lucroSemTaxa.toFixed(2)}%`;


                if (lucro > lucroMinimo) {
                  logger.write("\n" + Date() + "\n");
                  logger.write(res + "\n");
                  process.stdout.write(`Com taxa: ${res}\n`)
                  // process.stdout.write(`Sem Taxa: ${resSemTaxa}\n`)
                }
              }
            }
          }
        }
      }
    }
  }
}

// function verificarCaminho(pares: SymbolValue[]) {
//   for (let saldo of meus_saldos) {
//     let sequencia: Array<any> = [{ parInicial: saldo.symbol, valor: saldo.quantidade }]

//     loop(pares, saldo.symbol, 3, sequencia)

//   }
// }
// function loop(pares: SymbolValue[], parAnterior: string, loops: number, sequencia: Array<any>) {
//   for (let par of pares) {
//     if (loops > 1) {
//       if (parAnterior === par.baseAsset) {
//         sequencia.push({ par: par.symbol, baseAsset: par.baseAsset, quoteAsset: par.quoteAsset, acao: "compra" })
//         loop(pares, par.quoteAsset, loops - 1, sequencia)
//       }
//     }
//     else if (loops == 1) {
//       if (parAnterior === par.quoteAsset) {
//         sequencia.push({ par: par.symbol, baseAsset: par.baseAsset, quoteAsset: par.quoteAsset, acao: "venda" })
//         loop(pares, par.baseAsset, loops - 1, sequencia)
//         console.log(sequencia)
//         sequencia.pop()
//       }

//     }
//   }
// }