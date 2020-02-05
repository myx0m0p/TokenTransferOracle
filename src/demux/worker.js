require('dotenv').config()

const { BaseActionWatcher } = require("demux")
const { NodeosActionReader } = require("demux-eos")
const ObjectActionHandler = require("./ActionHandler")
const handlerVersion = require("./HandlerVersion.v1")

const actionHandler = new ObjectActionHandler([handlerVersion])

const actionReader = new NodeosActionReader({
  startAtBlock: -1,
  onlyIrreversible: false,
  nodeosEndpoint: process.env.API_URL
})

const actionWatcher = new BaseActionWatcher(
    actionReader,
    actionHandler,
    process.env.API_POLL_INTERVAL,
)

console.info("Demux worker started, API_URL =", process.env.API_URL, "poll interval =", process.env.API_POLL_INTERVAL, "ms.")

actionWatcher.watch()
