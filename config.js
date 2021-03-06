module.exports = {
    port: 3000,
    debug: 0,
    database: {
        DATABASE: 'scheduler',
        USERNAME: 'root',
        PASSWORD: 'devpass',
        PORT: '3306',
        HOST: '192.168.12.104'
    },
    database_ui: {
        DATABASE: 'milanooqa',
        USERNAME: 'root',
        PASSWORD: 'devpass',
        PORT: '3306',
        HOST: '192.168.12.104'
    },
    database_milanootest: {
        DATABASE: 'milanoo',
        USERNAME: 'dev',
        PASSWORD: 'devpass',
        PORT: '3306',
        HOST: '192.168.11.24'
    },
    code_success: 0, //操作成功无异常
    code_system: 10000, //系统级别错误
    //504gateway checker的设置
    gateway: {
        timerCron1: "0 30 8 * * *",
        timerCron2: "0 0 17 * * *",
        proxy: 'http://127.0.0.1:1100',
        target: 'http://www.milanoo.com/product/royal-retro-costume-women-s-victorian-ball-gown-jacquard-floral-green-ruffle-bows-tiered-vintage-princess-costume-p519003.html#m939417'
    },
    //broken checker的设置
    brokenChecker: {
        timerCron: "0 0 12 * * *"
    },
    //测试日报的设置
    dailyReport : {
        timerCron: "0 30 10 * * *"
    },
    //搜索结果监控设置
    searchCategory : {
        timerCron : "*/2 * * * * *",
    },
    //是否开启所有定时任务
    openScheduler : false,
    linkedInDriver : true,
    staticFolder : './static/'
}
