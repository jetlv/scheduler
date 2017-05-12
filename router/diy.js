/**
 * Created by Administrator on 2017/5/12.
 */
/**
 * Created by Administrator on 2017/4/11.
 */
const Router = require('koa-router');
const diy = new Router();
const config = require('../config');
const moment = require('moment');
const logger = require('../tool').logger;
const worker = require('../worker/milanooProductDiyFetcher').fetchDiys
const productsList = [681784, 63459, 65886, 70184, 65907, 70099, 255310, 368045, 38642, 23001, 9359, 16782, 34173, 7540, 51442, 44584, 78286, 51397, 64883, 103840, 51415, 90796, 64887, 68061, 83446, 80572, 97522, 146182, 57251, 104826, 52605, 146190, 24611, 77917, 41412, 21800, 17808, 74772, 35124, 67415, 74874, 23932, 74873, 73505, 23381, 31172, 99154, 82565, 77830, 73561, 31471, 37011, 30903, 42651, 35657, 110036, 73552, 51453, 18236, 17114, 20297, 12244, 38624, 11253, 34174, 27018, 16473, 51437, 44563, 78284, 51435, 80150, 64878, 25707, 4286, 82487, 42913, 57248, 104202, 193308, 681784, 26050, 28699, 41788, 25473, 63483, 4323, 233008, 44213, 53958, 54000, 28188, 4792, 14904, 17588, 67395, 17844, 41421, 26244, 31169, 31100, 73524, 29765, 99106, 48488, 71282, 73557, 4283, 37008, 36985, 30907, 68502, 75647, 146178, 63967, 94032, 40992, 51546, 30556, 71176, 34556];


diy.get('/diy', async(ctx) => {
    let diys = await worker(productsList);
    let htmls = [];
    diys.forEach((d, index, array) => {
        if(d.ProductsDiyArea) {
            htmls.push(d.ProductsDiyArea);
        }
    });
    ctx.body = '<html>' + htmls.join('\r\n'); + '</html>'

});

module.exports = {
    diy: diy
};