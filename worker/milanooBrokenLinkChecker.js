/**
 * Created by Administrator on 2017/4/19.
 */
const rp = require('request-promise');
const cheerio = require('cheerio');
const Promise = require('bluebird');
const fs = require('fs');
const sendMail = require('../tool').sendMail;
const df = require('../db/data-fetcher')
const logger = require('../tool').logger

let generalInfoScraping = async() => {
    let allUrl = 'http://www.milanoo.com/search?type=search&keyword=%60';
    let body = await rp.get(allUrl);
    let $ = cheerio.load(body);
    let pageNumber = parseInt($('.previous').eq(0).text().trim());
    let urls = [];
    for (p = 1; p <= pageNumber; p++) {
        (function (k) {
            urls.push('http://www.milanoo.com/search/ClassId-0-keyword-%60-' + k + '.html')
        })(p);
    }
    return urls;
}

/**
 *
 */
let scanAll = async() => {
    let result = [];
    // let urls = await generalInfoScraping();
    let urls = ['http://www.milanoo.com/search?type=search&keyword=588157'];
    //将本次操作记录到数据库
    let total = urls.length;
    let QUERY_SAVE_OPERATION = `insert into broken (b_time, b_total, b_found) values (now(), ${total}, 0)`;
    let r = await df(QUERY_SAVE_OPERATION);
    let insertId = r.insertId;
    await Promise.map(urls, async(url) => {
        let body = await rp.get(url);
        let $ = cheerio.load(body);
        let pics = [];
        $('.goods_item img').each(function (index, element) {
            let link = $(this).attr('original');
            let pid = $(this).attr('ctr-pid');
            pics.push({link: link, pid: pid});
        });
        await Promise.map(pics, async(picEntity) => {
            let picUrl = picEntity.link;
            let pid = picEntity.pid;
            let response = await rp({
                uri: encodeURI(picUrl),
                method: 'GET',
                resolveWithFullResponse: true,
                simple: false
            });
            if (!response.body) {
                result.push({picUrl: picUrl, pid: pid, reason: 'Empty response'});
            }
            if (response.statusCode > 400) {
                result.push({picUrl: picUrl, pid: pid, reason: 'Bad response code ' + response.statusCode});
            }
        }, {concurrency: 5})
    }, {concurrency: 2}).catch(err => {
        logger.error(err);
    });
    //入库操作
    try {
        if (result.length > 0) {
            let QUERY_UPDATE_FOUND = 'update broken b set b.b_found=1 where b.id = ' + insertId
            await df(QUERY_UPDATE_FOUND)
        }
        result.forEach((record, index, array) => {
            let bp_link = record.picUrl;
            let bp_pid = record.pid;
            let bp_reason = record.reason;
            let QUERY_SAVE_RECORD = `insert into broken_pic (bp_tid, bp_link, bp_pid, bp_reason) values (${insertId} , '${bp_link}', ${bp_pid}, '${bp_reason}')`;
            df(QUERY_SAVE_RECORD);
        })
        //邮件发送，后期屏蔽
        let html = '<html>';
        html += '<body>'
        html += '<table>'
        html += '<tr>'
        html += '<td>' + '链接' + '</td>';
        html += '<td>' + '商品id' + '</td>';
        html += '<td>' + '破图原因' + '</td>';
        html += '</tr>';
        result.forEach(function (r, index, array) {
            html += '<tr>'
            html += '<td>' + r.picUrl + '</td>';
            html += '<td>' + r.pid + '</td>';
            html += '<td>' + r.reason + '</td>';
            html += '</tr>';
        });
        html += '</table>'
        html += '</body>'
        html += '</html>';
        sendMail(html);
    } catch (err) {
        logger.error(err)
    }

}

let queryResult = async(dateDiff)=> {
    let QUERY_FETCH_ALL = 'select b.*, bp.* from broken_pic bp join broken b on bp.bp_tid = b.id WHERE DATEDIFF(b.b_time, NOW()) = ' + (dateDiff ? dateDiff : -1);
    let results = await df(QUERY_FETCH_ALL);
    return results;
}

module.exports = {
    scanAll: scanAll,
    queryResult: queryResult
}
