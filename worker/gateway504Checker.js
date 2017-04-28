/**
 * Created by Administrator on 2017/4/27.
 */
const rp = require('request-promise')
const config = require('../config')
const target = config.gateway.target
const Promise = require('bluebird')

let test504 = async(times) => {
    let options = {
        uri: target,
        simple: false,
        resolvedWithFullResponse: true,
        method: 'GET'
    }
    let count = 0;
    let trigger = () => {
        return rp(options).then(response => {
            let status = response.statusCode;
            if (status == 504) {
                count++
            }
            return 0;
        })
    }
    for (let i = 0; i < times; i++) {
        await trigger();
    }
    return count;
}

module.exports = test504;