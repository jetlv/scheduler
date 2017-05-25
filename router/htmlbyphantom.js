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
const Promise = require('bluebird')
const webdriver = require('selenium-webdriver')
const by = webdriver.By

let toFetch = async link => {
    let driver = linkedInDriver
    try {
        await driver.get(link)
        let signIn = false;
        try {
            await driver.findElement(by.xpath(`//*[text()='Sign in']`)).click()
            signIn = true
        } catch (err) {
            signIn = false
        }
        if (signIn) {
            await driver.findElement(by.css(`input[type='text']`)).sendKeys("jetlyu@aliyun.com")
            await driver.findElement(by.css(`input[type='password']`)).sendKeys("lc799110")
            await driver.findElement(by.css(`input[type='submit']`)).click()
        }
        await Promise.delay(3000)
        let source = await driver.getPageSource()
        return source
    } catch (err) {
        driver.quit()
        return err
    }

}

hbp.get('/hbp', async(ctx, next) => {
    let link = ctx.query.link;
    if ((!link) || !urlValidator(link)) {
        ctx.body = {success: false, message: 'Please input valid url'};
        return;
    }
    let content = await toFetch(link)
    ctx.body = {
        success: true,
        html: content
    }
});


module.exports = {
    hbp: hbp
};