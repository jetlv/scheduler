const Router = require('koa-router');
const wappalyzer = new Router();
const config = require('../config');
const moment = require('moment');
const logger = require('../tool').logger;
const rp = require('request-promise')
const urlValidator = require('../tool').urlValidator
const wapp = require('wappalyzer');

let fetchFromWappalyzer = async ctx => {
    let link = ctx.query.link;
    if ((!link) || !urlValidator(link)) {
        ctx.body = {success: false, message: 'Please input valid url'};
        return;
    }
    let fullReq = 'https://direct.wappalyzer.com/console?url=' + link;
    let result = await rp.get(fullReq);
    let matching = result.match(/parent\.postMessage\((\{.*\]\}),/);
    if (matching) {
        ctx.body = {success: true, result: JSON.parse(matching[1])}
    } else {
        ctx.body = {success: true, result: null}
    }
}

/**
 * Promisify Wappalyzer
 * @param url
 */
let promisedWappalyzer = url => {
    return new Promise((res, rej) => {
        wapp.run([url, '--quiet'], function (stdout, stderr) {
            if (stdout) {
                res(stdout);

            }
            if (stderr) {
                rej(stderr)
            }
        });
    })
}


let fetchFromWappalyzerOfficial = async ctx => {
    let link = ctx.query.link;
    if ((!link) || !urlValidator(link)) {
        ctx.body = {success: false, message: 'Please input valid url'};
        return;
    }
    try {
        let result = await promisedWappalyzer(link)
        ctx.body = {success: true, result: JSON.parse(result)}
    } catch (err) {
        ctx.body = {success: false, message: err}
    }
}

wappalyzer.get('/wappalyzer', fetchFromWappalyzerOfficial);


module.exports = {
    wappalyzer: wappalyzer
};