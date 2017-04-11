const query = require('./async-db')
async function performQuery(sql) {
    let dataList = await query(sql)
    return dataList
}

module.exports = performQuery;
