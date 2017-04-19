/**
 * Created by Administrator on 2017/4/19.
 */
const log4js = require('log4js');
log4js.configure({
    appenders: [{type: 'file', filename: 'cheese.log'}],
    categories: {default: {appenders: ['cheese'], level: 'error'}}
});
const logger = log4js.getLogger('cheese');
logger.setLevel('ERROR');
const nodemailer = require('nodemailer');
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
        from: '"米兰监控" <qadepartment@163.com>', // sender address
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

module.exports = {
    logger : logger,
    sendMail : sendMail
}