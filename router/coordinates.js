/**
 * Created by Administrator on 2017/4/11.
 */
const Router = require('koa-router');
const coordinates = new Router();
const df = require('../db/data-fetcher');
const config = require('../config');
const moment = require('moment');
const logger = require('../tool').logger;
const coordtransform = require('coordtransform');

coordinates.get('/coordinates/bd09togcj02', async(ctx) => {
    let lng = ctx.query.lng;
    let lat = ctx.query.lat;
    // let newLatgcj02 = coordtransform.bd09togcj02(lng, lat)[1];
    // let newLnggcj02 = coordtransform.bd09togcj02(lng, lat)[0];
    // ctx.body = {
    //     success: true,
    //     lat_gcj02: newLatgcj02,
    //     lng_gcj02: newLnggcj02
    // }
    let x = lng - 0.0065, y = lat - 0.006;
    let z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * pi);
    let theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * pi);
    let newLnggcj02 = z * Math.cos(theta);
    let newLatgcj02 = z * Math.sin(theta);
    ctx.body = {
        success: true,
        lat_gcj02: newLatgcj02,
        lng_gcj02: newLnggcj02
    }
}).get('/coordinates/gcj02towgs84', async(ctx) => {
    let lng = ctx.query.lng;
    let lat = ctx.query.lat;
    let newLatwgs84 = coordtransform.gcj02towgs84(lng, lat)[1];
    let newLngwgs84 = coordtransform.gcj02towgs84(lng, lat)[0];
    ctx.body = {
        success: true,
        lat_wgs84: newLatwgs84,
        lng_wgs_84: newLngwgs84
    }
}).get('/coordinates/bd09towgs84', async(ctx) => {
    let lng = ctx.query.lng;
    let lat = ctx.query.lat;
    let newLatgcj02 = coordtransform.bd09togcj02(lng, lat)[1];
    let newLnggcj02 = coordtransform.bd09togcj02(lng, lat)[0];
    let newLatwgs84 = coordtransform.gcj02towgs84(newLnggcj02, newLatgcj02)[1];
    let newLngwgs84 = coordtransform.gcj02towgs84(newLnggcj02, newLatgcj02)[0];
    ctx.body = {
        success: true,
        lat_wgs84: newLatwgs84,
        lng_wgs_84: newLngwgs84
    }
});

module.exports = coordinates;