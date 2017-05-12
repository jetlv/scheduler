/**
 * Created by Administrator on 2017/4/19.
 */
const log4js = require('log4js');
const moment = require('moment');
log4js.configure({
    appenders: [{type: 'dateFile', filename: 'cheese.log', "pattern": "-yyyy-MM-dd","alwaysIncludePattern": true}],
    categories: {default: {appenders: ['cheese'], level: 'error'}}
});
const logger = log4js.getLogger('cheese');
logger.setLevel('ERROR');
const nodemailer = require('nodemailer');
const validator = require('validator');

let sendMail = (html) => {
    var transporter = nodemailer.createTransport({
        host: 'smtp.163.com',
        secureConnection: true,
        port: 465,
        auth: {
            user: 'qadepartment@163.com',
            pass: 'bdyxdovlpgerwhtc'
        },
        tls: {
            secureProtocol: "TLSv1_method"
        }
    });

    let mailOptions = {
        from: '"米兰自动化测试中心" <qadepartment@163.com>', // sender address
        to: 'lvchao@milanoo.com,wangzhihua@milanoo.com', // list of receivers
        subject: '监控报告', // Subject line
        html: html // html body
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message %s sent: %s', info.messageId, info.response);
    });
}

/**
 * 发送自动化测试日报，给到lvchao@milanoo.com和wangzhihua@milanoo.com
 * @param html
 */
let sendDailyReport = (html) => {
    var transporter = nodemailer.createTransport({
        host: 'smtp.163.com',
        secureConnection: true,
        port: 465,
        auth: {
            user: 'qadepartment@163.com',
            pass: 'bdyxdovlpgerwhtc'
        },
        tls: {
            secureProtocol: "TLSv1_method"
        }
    });
    let fmtDate = moment(Date.now()).add(-1, 'days').format("YYYY/MM/DD")
    let mailOptions = {
        from: '"米兰自动化测试中心" <qadepartment@163.com>', // sender address
        to: 'lvchao@milanoo.com,wangzhihua@milanoo.com', // list of receivers
        subject: '自动化测试日报' + fmtDate, // Subject line
        html: html // html body
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message %s sent: %s', info.messageId, info.response);
    });
}

/**
 * 发送报告给指定人
 * @param html
 * @param receivers 逗号隔开
 */
let sendDailyReportToPeople = (html, receivers) => {
    var transporter = nodemailer.createTransport({
        host: 'smtp.163.com',
        secureConnection: true,
        port: 465,
        auth: {
            user: 'qadepartment@163.com',
            pass: 'bdyxdovlpgerwhtc'
        },
        tls: {
            secureProtocol: "TLSv1_method"
        }
    });
    let fmtDate = moment(Date.now()).add(-1, 'days').format("YYYY/MM/DD")
    let mailOptions = {
        from: '"米兰自动化测试中心" <qadepartment@163.com>', // sender address
        to: receivers, // list of receivers
        subject: '自动化测试日报' + fmtDate, // Subject line
        html: html // html body
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message %s sent: %s', info.messageId, info.response);
    });
}

/**
 * 验证url
 * @param link
 * @returns {boolean}
 */
let urlValidator = link => {
    if (typeof link !== 'string') {
        return false;
    }
    /** Validate url */
    let validatorOptions = {
        protocols: ['http', 'https'],
        require_protocol: true,
        allow_underscores: true,
        allow_trailing_dot: true
    };
    if (link.indexOf('#') !== -1) {
        let mainPart = link.split('#')[0];
        if (!validator.isURL(mainPart, validatorOptions)) {
            return false;
        }
        return true;
    } else {
        if (!validator.isURL(link, validatorOptions)) {
            return false;
        }
        return true;
    }
}


module.exports = {
    logger: logger,
    sendMail: sendMail,
    sendDailyReport : sendDailyReport,
    sendDailyReportToPeople : sendDailyReportToPeople,
    urlValidator : urlValidator
}