const mysql = require('mysql');
const config = require('../config');

const pool = mysql.createPool({
    host: config.database_ui.HOST,
    user: config.database_ui.USERNAME,
    password: config.database_ui.PASSWORD,
    database: config.database_ui.DATABASE
})

let query = (sql, values) => {
    return new Promise((resolve, reject) => {
        pool.getConnection(function (err, connection) {
            if (err) {
                reject(err)
            } else {
                connection.query(sql, values, (err, rows) => {

                    if (err) {
                        reject(err)
                    } else {
                        resolve(rows)
                    }
                    connection.release()
                })
            }
        })
    })
}

module.exports = query