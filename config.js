module.exports = {
    port: 3001,
    debug: 0,
    database: {
        DATABASE: 'scheduler',
        USERNAME: 'root',
        PASSWORD: 'devpass',
        PORT: '3306',
        HOST: 'localhost'
    },
    code_success : 0, //操作成功无异常
    code_system : 10000, //系统级别错误
    //504gateway checker的设置
    gateway : {
        timerCron1 : "0 30 8 * * *",
        timerCron2 : "0 0 17 * * *",
        proxy : '',
        target : 'http://www.milanoo.com/product/royal-retro-costume-women-s-victorian-ball-gown-jacquard-floral-green-ruffle-bows-tiered-vintage-princess-costume-p519003.html#m939417'
    },
    brokenChecker : {
        timerCron : "0 0 12 * * *"
    }
}
