const query = require('./async-db-ui')
async function performQuery(sql) {
    let dataList = await query(sql)
    return new Promise((resolve, reject) => {
        resolve(dataList);
    });
}

module.exports = performQuery;
