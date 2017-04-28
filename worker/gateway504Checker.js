/**
 * Created by Administrator on 2017/4/27.
 */
const rp = require('request-promise')
const config = require('../config')
const target = config.gateway.target
const Promise = require('bluebird')

let test504 = async(times) => {
    let options = {
        proxy: config.gateway.proxy,
        uri: target,
        simple: false,
        resolvedWithFullResponse: true,
        method: 'GET'
    }
    let count = 0;
    let badResponse = [];
    let trigger = () => {
        return rp(options).then(response => {
            let status = response.statusCode;
            if (status > 400) {
                badResponse.push(status);
            }
            if (status == 504) {
                count++
            }
            return 0;
        })
    }
    for (let i = 0; i < times; i++) {
        await trigger();
    }
    return {count_504: count, badResponse: badResponse.join(', ')};
}

module.exports = test504;