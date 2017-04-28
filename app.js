const Koa = require('koa');
const app = new Koa();
const config = require('./config');

//Third-party
const nodeScheduler = require('node-schedule')

//Internal
const gatewayChecker = require('./router/gateway').checker
const brokenPic = require('./worker/milanooBrokenLinkChecker')

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
app.use(gateway.routes(), gateway.allowedMethods());
app.use(broken.routes(), broken.allowedMethods());
app.use(coordinates.routes(), coordinates.allowedMethods());
app.use(uitest.routes(), uitest.allowedMethods());
app.use(mf.routes()).use(mf.allowedMethods())

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
    gatewayChecker({});
});
let gatewayAfternoon = nodeScheduler.scheduleJob(config.gateway.timerCron2, () => {
    gatewayChecker({});
});
let brokenPic = nodeScheduler.scheduleJob(config.brokenChecker.timerCron, () => {
    brokenPic();
})

//系统设置
process.on("SIGINT", function () {
    console.log("正在愉快的关闭服务器...");
    // app.close();
    console.log("正在撤销定时器...")
    gatewayMorning.cancel();
    gatewayAfternoon.cancel();
    brokenPic.cancel();
    console.log("已经撤销全部定时器...")
    console.log("服务器成功终止...")
});

app.listen(3000);