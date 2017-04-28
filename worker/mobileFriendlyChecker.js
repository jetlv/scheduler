/**
 * Created by Administrator on 2017/4/27.
 */
let rp = require('request-promise');
let cheerio = require('cheerio')
let fs = require('fs')

let isFriendly = url => {
    let userAgentMobile = 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1';
    let userAgentPC = 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36';

    let mobileOption = {
        uri: url,
        method: 'GET',
        headers: {
            'User-Agent': userAgentMobile
        }
    }

    let pcOption = {
        uri: url,
        method: 'GET',
        headers: {
            'User-Agent': userAgentPC
        }
    }

    return rp(mobileOption).then(mobileBody => {
        let $ = cheerio.load(mobileBody);
        let mobileHeader = $('head').text();
        return rp(pcOption).then(pcBody => {
            let $ = cheerio.load(pcBody);
            let pcHeader = $('head').text();
            return new Promise((res, rej) => {
                res(!(mobileHeader == pcHeader));
            })
        })
    });
}

module.exports = isFriendly