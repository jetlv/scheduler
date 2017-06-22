/**
 * Created by Administrator on 2017/6/22.
 */


let loadtest = require('loadtest');
let Promise = require('bluebird')
let logger = require('../tool').logger
let db = require('../db/data-fetcher')

/**
 * promisified的测试函数
 */
let promisedLoadTest = (ctx) => {
    let url = ctx.query.url
    let maxRequests = ctx.query.maxRequests
    let maxSeconds = ctx.query.maxSeconds
    let requestsPerSecond = ctx.query.requestsPerSecond
    let options = {
        url: url,
        // concurrency: 50,
        maxRequests: maxRequests,
        maxSeconds: maxSeconds,
        requestsPerSecond: requestsPerSecond,
        agentKeepAlive: true
    };
    return new Promise((resolve, reject) => {
        loadtest.loadTest(options, function (error, result) {
            if (error) {
                logger.error(`LOAD TEST ERROR - ${error}`)
                reject(error)
            }
            resolve(result)
        });
    })
}

let loadTestingLogic = async(insertedId, ctx) => {
    try {
        let report = await promisedLoadTest(ctx)
        let parameters = JSON.stringify(ctx.query)
        let totalRequests = report.totalRequests
        let totalErrors = report.totalErrors
        let totalTimeSeconds = report.totalTimeSeconds
        let rps = report.rps
        let meanLatencyMs = report.meanLatencyMs
        let maxLatencyMs = report.maxLatencyMs
        let minLatencyMs = report.minLatencyMs
        let percentiles50 = report.percentiles[50]
        let percentiles90 = report.percentiles[90]
        let percentiles95 = report.percentiles[95]
        let percentiles99 = report.percentiles[99]
        let errorCodes = JSON.stringify(report.errorCodes)
        let query_update = `update loadtest lt set 
    lt.parameters = '${parameters}',
    lt.totalRequests = ${totalRequests},
    lt.totalErrors = ${totalErrors},
    lt.totalTimeSeconds = ${totalTimeSeconds},
    lt.rps = ${rps},
    lt.meanLatencyMs = ${meanLatencyMs},
    lt.maxLatencyMs = ${maxLatencyMs},
    lt.minLatencyMs = ${minLatencyMs},
    lt.percentiles50 = ${percentiles50},
    lt.percentiles90 = ${percentiles90},
    lt.percentiles95 = ${percentiles95},
    lt.percentiles99 = ${percentiles99},
    lt.errorCodes = '${errorCodes}'
    where lt.id=${insertedId}`
        await db(query_update)
    } catch (error) {
        logger.error(error)
    }
}

module.exports = {
    promisedLoadTest: promisedLoadTest,
    loadTestingLogic: loadTestingLogic
}
