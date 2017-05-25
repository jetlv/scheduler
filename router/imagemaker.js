/**
 * Created by Administrator on 2017/5/25.
 */
/**
 * Created by Administrator on 2017/4/11.
 */
const Router = require('koa-router');
const imageMaker = new Router();
const config = require('../config');
const moment = require('moment');
const logger = require('../tool').logger;
const fs = require('fs')
const send = require('koa-send');

/**
 * 注意，这个功能是没做好的，不要用。如果以后做好，请取消这个注释
 */
imageMaker.get('/imagemaker/:size/:suffix', async(ctx, next) => {
    let size = ctx.params.size;
    let suffix = ctx.params.suffix;
    if (!size) {
        size = 2
    }
    if (size > 50) {
        ctx.body = {
            success: false,
            message: '您申请的文件太大了'
        }
        return
    }
    let iPath = `${__dirname}/../images/${size}.${suffix}`
    let already = fs.existsSync(iPath)
    let base = `${__dirname}/../images/base.jpg`
    if (!already) {
        fs.writeFileSync(iPath, Buffer.concat([new Buffer(fs.readFileSync(base).toString('base64')), new Buffer(fs.readFileSync(base).toString('base64'))]))
    }
    // ctx.headers = 'Content-Type: image/png'
    // ctx.body = fs.createReadStream(iPath)
    await send(ctx, `/images/${size}.${suffix}`);
});


module.exports = {
    imageMaker: imageMaker
};