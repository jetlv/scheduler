const Koa = require('koa');
const app = new Koa();
const config = require('./config');

//Third-party
const nodeScheduler = require('node-schedule')

//Internal
const gatewayChecker = require('./router/gateway').scheduled_checker
const brokenPic = require('./worker/milanooBrokenLinkChecker').scanAll
const dailyReportMaker = require('./router/emailreport').makeReport

//Middlewares
const loggerAsync = require('./middleware/logger-async')
const bodyParser = require('koa-bodyparser')
const jsonp = require('koa-jsonp')
app.use(loggerAsync())
app.use(bodyParser())
app.use(jsonp());

//Router
const gateway = require('./router/gateway').gateway
const broken = require('./router/broken')
const coordinates = require('./router/coordinates');
const uitest = require('./router/uitest')
const mf = require('./router/mobilefriendly')
const emailreport = require('./router/emailreport').emailreport
const domainChecker = require('./router/domainchecker').domainChecker
const helper = require('./router/helper').helper;
const alexa = require('./router/alexa').alexa
const diy = require('./router/diy').diy
const wappalyzer = require('./router/wappalyzer').wappalyzer
const business = require('./router/business').business
app.use(gateway.routes(), gateway.allowedMethods());
app.use(broken.routes(), broken.allowedMethods());
app.use(coordinates.routes(), coordinates.allowedMethods());
app.use(uitest.routes(), uitest.allowedMethods());
app.use(mf.routes(), mf.allowedMethods())
app.use(emailreport.routes(), emailreport.allowedMethods())
app.use(domainChecker.routes(), domainChecker.allowedMethods())
app.use(helper.routes(), helper.allowedMethods())
app.use(alexa.routes(), alexa.allowedMethods())
app.use(diy.routes(), diy.allowedMethods())
app.use(wappalyzer.routes(), wappalyzer.allowedMethods())
app.use(business.routes(), business.allowedMethods())

app.use(async(ctx, next) => {
    await next();
    ctx.response.body = {
        success: false,
        code: config.code_system,
        message: '错误的路径'
    }
});

//启动一些timer
let gatewayMorning = nodeScheduler.scheduleJob(config.gateway.timerCron1, () => {
    gatewayChecker(500);
});
let gatewayAfternoon = nodeScheduler.scheduleJob(config.gateway.timerCron2, () => {
    gatewayChecker(500);
});
let brokenPicNoon = nodeScheduler.scheduleJob(config.brokenChecker.timerCron, () => {
    brokenPic();
})

let dailyReport = nodeScheduler.scheduleJob(config.dailyReport.timerCron, () => {
    dailyReportMaker();
})

//系统设置
process.on("SIGINT", function () {
    console.log("正在愉快的关闭服务器...");
    // app.close();
    console.log("正在撤销定时器...")
    gatewayMorning.cancel();
    gatewayAfternoon.cancel();
    brokenPicNoon.cancel();
    dailyReport.cancel();
    console.log("已经撤销全部定时器...")
    console.log("服务器成功终止...")
    process.exit(0);
});

app.listen(config.port);