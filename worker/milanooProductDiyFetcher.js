/**
 * Created by Administrator on 2017/5/12.
 */

const df_milanootest = require('../db/data-fetcher-milanootest');

/**
 * 从数据库拉商品的diy信息
 * @param idArray 商品id数组
 * @returns {*}
 */
let fetchDiys = async idArray => {
    let QUERY_FETCH_DIY = 'select pl.ProductsDiyArea from milanoo_gaea.products_lang pl where pl.id in (' + idArray.join(',') + ')'
    let results = await df_milanootest(QUERY_FETCH_DIY)
    return results
}

module.exports = {
    fetchDiys: fetchDiys
}