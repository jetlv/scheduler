const Koa = require('koa');
const app = new Koa();
const config = require('./config');

//Middlewares
const loggerAsync = require('./middleware/logger-async')
const bodyParser = require('koa-bodyparser')
const jsonp = require('koa-jsonp')
app.use(loggerAsync())
app.use(bodyParser())
app.use(jsonp());

//Router
const gateway = require('./router/gateway')
const broken = require('./router/broken')
app.use(gateway.routes(), gateway.allowedMethods());
app.use(broken.routes(), broken.allowedMethods());

app.use(async(ctx, next) => {
    await next();
    ctx.response.body = {
        success: false,
        code: config.code_system,
        message: '错误的路径'
    }
});

app.listen(3000);