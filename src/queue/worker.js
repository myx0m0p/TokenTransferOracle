require('dotenv-safe').config()

const Logger = require('bunyan')

const request = require('request')

const {BaseQueue} = require("./BaseQueue")

const log = Logger.createLogger({ name: 'queue-worker' })

BaseQueue.process('process:transaction', async (job) => {

  const options = {
    uri: process.env.NOTIFICATION_URL,
    method: process.env.NOTIFICATION_METHOD,
    json: JSON.stringify(job.data)
  }

  log.info("Sending payload:\n", JSON.stringify(options, null, 2))

  request(options, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      return Promise.resolve(response.statusCode)
    } else {
      return Promise.reject(error)
    }
  })
})

BaseQueue.on('global:completed', (jobId, result) => {
  log.info("Job", jobId, "completed, with result:", result)
})

BaseQueue.on('global:failed', (jobId, error) => {
  log.error("Job", jobId, "failed, with error:", error)
  /*
  BaseQueue.getJob(jobId).then(function(job) {
    job.retry()
  })
  */
})

BaseQueue.on('global:error', (error) => {
  log.error(error)
})

log.info("Queue worker started, payload URL =", process.env.NOTIFICATION_URL)

