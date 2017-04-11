module.exports = {
    port: 3001,
    debug: 1,
    database: {
        DATABASE: 'scheduler',
        USERNAME: 'root',
        PASSWORD: 'devpass',
        PORT: '3306',
        HOST: 'localhost'
    },
    code_success : 0, //操作成功无异常
    code_system : 10000, //系统级别错误
}
