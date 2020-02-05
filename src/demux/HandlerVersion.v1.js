require('dotenv').config()

const {BaseQueue} = require("../queue/BaseQueue")

function parseTokenString(tokenString) {
  const [amountString, symbol] = tokenString.split(" ")
  const amount = parseFloat(amountString)
  return { amount, symbol }
}

function updateTransferData(state, payload, blockInfo, context) {
  const { amount, symbol } = parseTokenString(payload.data.quantity)
  if (!state.volumeBySymbol[symbol]) {
    state.volumeBySymbol[symbol] = amount
  } else {
    state.volumeBySymbol[symbol] += amount
  }
  state.totalTransfers += 1
  context.stateCopy = JSON.parse(JSON.stringify(state)) // Deep copy state to de-reference
}

const updaters = [
  {
    actionType: process.env.LISTEN_ACTION,
    apply: updateTransferData,
  },
]


/*

payload:
{
  transactionId: 'c46524bdd2a81afd400bf97ca2983ea215e633927efcae21cd904eaa132b5451',
  actionIndex: 0,
  account: 'eosio.token',
  name: 'transfer',
  authorization: [ { actor: 'andrewufirst', permission: 'active' } ],
  data: { from: 'andrewufirst', to: 'u', quantity: '3.0000 UOS', memo: '3m' }
}
blockInfo:
{
  blockNumber: 14286200,
  blockHash: '00d9fd787adcc6664c2890de176613a5504c1ca1814ebd67688f1e0adb183bfb',
  previousBlockHash: '00d9fd77ce3b5acdcfc2f032da20b8990137b8639f2d147498f9366506ca76f5',
  timestamp: 2020-02-04T06:57:22.500Z
}

 */

function queueUpdate(payload, blockInfo, context) {
  if(payload && payload.data) {
    let transactionData = payload.data

    let queueItem = {
      blockNumber: blockInfo.blockNumber,
      blockHash: blockInfo.blockHash,
      blockTime: blockInfo.timestamp,
      transferFrom: transactionData.from,
      transferTo: transactionData.to,
      transferQuantity: transactionData.quantity,
      transferMemo: transactionData.memo,
    }
    console.info("Got transaction:\n", JSON.stringify(queueItem, null, 2))
    //console.info("State updated:\n", JSON.stringify(context.stateCopy, null, 2))

    if(queueItem.transferTo === process.env.LISTEN_ACCOUNT) {
      console.info("Item added to queue")
      BaseQueue.add('process:transaction', queueItem)

    } else {
      console.info("Item not added to queue, as destination account not matched to monitored account", process.env.ACCOUNT_TO_MONITOR)
    }
  }
}

const effects = [
  {
    actionType: process.env.LISTEN_ACTION,
    run: queueUpdate,
  },
]


const handlerVersion = {
  versionName: "v1",
  updaters,
  effects,
}

module.exports = handlerVersion
