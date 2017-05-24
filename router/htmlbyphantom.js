/**
 * Created by Administrator on 2017/5/24.
 */
const Router = require('koa-router');
const hbp = new Router();
const config = require('../config');
const moment = require('moment');
const logger = require('../tool').logger;
const phantom = require('phantom')
const urlValidator = require('../tool').urlValidator

hbp.get('/hbp', async(ctx, next) => {
    let link = ctx.query.link;
    if ((!link) || !urlValidator(link)) {
        ctx.body = {success: false, message: 'Please input valid url'};
        return;
    }
    const instance = await phantom.create();
    const page = await instance.createPage();

    const status = await page.open(link);
    if(status !== 'success'){
        ctx.body = {
            success: false,
            message : 'Can not fetch html'
        }
        return
    }
    const content = await page.property('content');
    await instance.exit();
    ctx.body = {
        success : true,
        html : content
    }
});




module.exports = {
    hbp : hbp
};