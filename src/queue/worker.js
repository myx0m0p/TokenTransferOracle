const request = require('request')

const {BaseQueue} = require("./BaseQueue")

BaseQueue.process('process:transaction', async (job) => {

  const options = {
    uri: process.env.NOTIFICATION_URL,
    method: process.env.NOTIFICATION_METHOD,
    json: JSON.stringify(job.data)
  }

  console.log("Sending payload:\n", JSON.stringify(options, null, 2))

  request(options, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      //console.log(response)
      return Promise.resolve(response.statusCode)
    } else {
      return Promise.reject(error)
    }
  })

  //return Promise.reject("Generic Error")
})

BaseQueue.on('global:completed', (jobId, result) => {
  console.info("Job", jobId, "completed, with result:", result)
})

BaseQueue.on('global:failed', (jobId, error) => {
  console.error("Job", jobId, "failed, with error:", error)
  /*
  BaseQueue.getJob(jobId).then(function(job) {
    job.retry()
  })
  */
})

BaseQueue.on('global:error', (error) => {
  console.error("Generic error:", error)
})

console.info("Queue worker started, payload URL =", process.env.NOTIFICATION_URL)

console.info("Jobs:\n", JSON.stringify(BaseQueue.getJobs(["process:transaction"]), null, 2))

