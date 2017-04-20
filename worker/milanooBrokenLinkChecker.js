/**
 * Created by Administrator on 2017/4/19.
 */
const rp = require('request-promise');
const cheerio = require('cheerio');
const Promise = require('bluebird');
const fs = require('fs');
const sendMail = require('../tool').sendMail;

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

let scanAll = async() => {
    let result = [];
    let urls = await generalInfoScraping();
    // let urls = ['http://www.milanoo.com/search?type=search&keyword=548417'];
    await Promise.map(urls, async(url) => {
        let body = await rp.get(url);
        // require('fs').writeFileSync('body.html', body);
        let $ = cheerio.load(body);
        let pics = [];
        $('.goods_item img').each(function (index, element) {
            let link = $(this).attr('original');
            let pid = $(this).attr('ctr-pid');
            pics.push({link: link, pid: pid});
        });
        // pics = [];
        // let alll = fs.readFileSync('broken.txt').toString().split('\r\n');
        // alll.forEach((line, index, array)=> {
        //     let link = line.split(' - ')[0];
        //     let pid = line.split(' - ')[1];
        //     pics.push({link: link, pid: pid});
        // })
        await Promise.map(pics, async(picEntity) => {
            let picUrl = picEntity.link;
            let pid = picEntity.pid;
            let response = await rp({uri: encodeURI(picUrl), method: 'GET', resolveWithFullResponse: true, simple: false});
            if (!response.body) {
                result.push({picUrl: picUrl, pid: pid, reason: 'Empty response'});
                // fs.appendFileSync('broken.txt', picUrl + ' - ' + pid + ' - ' + 'empty response' + '\r\n')
            }
            if (response.statusCode > 400) {
                result.push({picUrl: picUrl, pid: pid, reason: 'Bad response code ' + response.statusCode});
                // fs.appendFileSync('broken.txt', picUrl + ' - ' + pid + ' - ' + response.statusCode) + '\r\n)';
            }
        }, {concurrency: 5})
    }, {concurrency: 2});
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
}

module.exports = scanAll;
