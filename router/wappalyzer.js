const Router = require('koa-router');
const wappalyzer = new Router();
const config = require('../config');
const moment = require('moment');
const logger = require('../tool').logger;
const rp = require('request-promise')
const urlValidator = require('../tool').urlValidator

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


wappalyzer.get('/wappalyzer', fetchFromWappalyzer);


module.exports = {
    wappalyzer: wappalyzer
};