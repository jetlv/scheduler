/**
 * Created by Administrator on 2017/5/16.
 */

const fs = require('fs');
const rp = require('request-promise')
const config = require('../config')
const Promise = require('bluebird')
const tool = require('../tool');
const cheerio = require('cheerio');
const df = require('../db/async-db-milanootest');
const logger = tool.logger

/**
 * 注册一个新用户
 * @returns {Promise.<TResult>}
 */
let newUser = () => {
    let randomString = tool.randomStr(8);
    //在英语站注册即可，英语站注册了其他语言站也通用
    let registerUri = `http://192.168.11.67:8080/sp/member/memberRegister.htm?member.email=${randomString}@milanoo.com&member.userPass=${randomString}&member.lang=en-uk`
    let regOptions = {uri: registerUri, method: 'GET', gip: true, json: true};
    return rp.get(regOptions).then(body => {
        return {
            result: body,
            email: `${randomString}@milanoo.com`,
            password: randomString
        };
    })
}

/**
 * 用户登录
 * @param lang 语言站
 * @param email 邮箱
 * @param password 密码
 * @returns {Promise.<TResult>} 返回一个上下文，里面包括lang, email ,password, cookie以及登陆后的body
 */
let userLogin = (lang, email, password) => {
    let base = 'http://test.item.www.milanoo.com/' + lang;
    if (lang == 'jp') {
        base = 'http://test.item.www.milanoo.jp';
    }
    let getSessionOptions = {method: 'GET', uri: base + '/member/login.html', gzip: true, resolveWithFullResponse: true}
    let context = {lang: lang, email: email, password: password, base: base}
    return rp(getSessionOptions).then(response => {
        let cookies = tool.getSessions(response);
        context.cookies = cookies;
        return cookies;
    }).then(cookies => {
        let headers = {
            "Cookie": cookies
        }
        let form = {
            loginusername: email,
            loginuserpass: password
        }
        let loginOptions = {
            uri: base + '/member/login.html',
            method: 'POST',
            headers: headers,
            form: form,
            followAllRedirects: true
        }
        return rp(loginOptions)
    }).then(body => {
        context.body = body;
        return context;
    })
}

/**
 * 加入到购物车
 * @param lang
 * @param email
 * @param password
 * @param productId
 * @returns {Promise.<TResult>}
 */
let addToCart = (lang, email, password, productId) => {
    let context = {};
    return userLogin(lang, email, password).then(ctx => {
        context = ctx;
        context.productId = productId
        //去获取商品的sku
        let productDetailsUrl = `http://192.168.11.67:8080/distribution/product/getProductDetails.json?productId=${productId}&langId=2&websiteId=1`
        let productDetailsOptions = {
            uri: productDetailsUrl,
            method: 'GET',
            gzip: true,
            json: true
        }
        return rp(productDetailsOptions);
    }).then(result => {
        //取第一个sku即可
        context.sku = [];
        let firstSkuProperties = result.body.object.salesProperty.skusArr[0].skuPropertyArr;
        firstSkuProperties.forEach((property, index, array) => {
            let id = property.propertyId;
            let configurationValue = property.option.configurationValue;
            context.sku.push({id: id, configurationValue: configurationValue})
        })
    }).then(() => {
        //加入到购物车
        let headers = {
            "Cookie": context.cookies
        }
        let form = {
            buytype: 0,
            websiteId: 1,
            ProductsId: context.productId,
            num: 1,
            countryId: 1
        }
        context.headers = headers;
        let sku = context.sku;
        sku.forEach((prop, index, array) => {
            if (prop.configurationValue == 'custom') {
                throw '请选择无定制属性的商品'
            }
            form[`CustomAttributes_array[${prop.id}]`] = prop.configurationValue;
        })
        let addToCartOptions = {
            uri: `${context.base}/shop/Cart.html`,
            method: 'POST',
            headers: headers,
            form: form,
            simple: false
        }
        return rp(addToCartOptions)
    }).then(() => {
        return context;
    })
}

/**
 * 下订单
 * @param lang
 * @param email
 * @param password
 * @param productId
 * @returns {{}}
 */
let placeOrder = async(lang, email, password, productId, currency) => {
    let context = {};
    try {
        context = await addToCart(lang, email, password, productId);
        if (currency) {
            // let currencyChangeUrl = `http://test.item.www.milanoo.com/app/currency.html?currency=${currency}`
            // let currencyChangeOptions = {
            //     uri: currencyChangeUrl,
            //     headers: context.headers,
            //     method: 'GET',
            //     followAllRedirects: true
            // }
            // let cc = await rp(currencyChangeOptions);
            // fs.writeFileSync('cc.html', cc);
            context.headers.Cookie = context.headers.Cookie.replace('CurrencyCode=USD;', `CurrencyCode=${currency};`)
        }

        //走step1，获取formAuth和cartId
        let base = context.base;
        let headers = context.headers;
        let step1ReqUrl = `${base}/shop/Step1.html`;
        let step1Options = {
            uri: step1ReqUrl,
            method: 'GET',
            headers: headers
        }
        let step1Response = await rp(step1Options);
        let $ = cheerio.load(step1Response)
        context.formAuth = $('input[name="formAuth"]').attr('value');
        context.cartId = $('input[name="cartId[]"]').attr('value');
        //顺便查一下用户id
        let QUERY_MEMID = `select m.MemberId as mid from milanoo_member m where m.MemberEmail='${context.email}'`;
        let m = await df(QUERY_MEMID)
        let memberId = m[0].mid;
        context.memberId = memberId;
        let fetchAddrIdUrl = `http://192.168.11.67:8080/member/member/getMemberAddressBook.htm?memberId=${memberId}&languageCode=en-uk&websiteId=1`
        let address = await rp({uri: fetchAddrIdUrl, method: 'GET', gzip: true, json: true});
        let addressId = address.consigneeAddr[0].id;
        //开始下单
        let form = {
            "formAuth": context.formAuth,
            "websiteId": "1",
            "stateId": "1",
            "addressId": addressId,
            "logistics_key": "Standard", //此处只用standard，有些商品没有其他方式，就会出错
            "insurance": "1.99",
            "cartId[]": context.cartId,
            "remarks": "",
            "act": "coupons",
            "libkey": ""
        }
        let placeOrderOptions = {
            uri: `${context.base}/shop/Step2.html`,
            method: 'POST',
            form: form,
            gzip: true,
            headers: context.headers,
            followAllRedirects: true
        }
        let body = await rp(placeOrderOptions);
        let orderId = body.match(/"Order_ID" : "(\d+)"/)[1];
        context.orderId = orderId
        return context
    } catch (err) {
        logger.error(err);
        context.error = err;
        return context;
    }
}

/**
 * 巴西分期付款
 * @param lang
 * @param email
 * @param password
 * @param productId
 * @returns {{}}
 */
let fenqi = async(lang, email, password, productId)=> {
    let context = await placeOrder(lang, email, password, productId, 'BRL');
    let orderId = context.orderId;
    let paymentUrl = `http://test.item.www.milanoo.com/shop/Payment-id-${orderId}.html`;
    let headers = context.headers;
    let form = {
        formAuth: context.formAuth,
        act: 'payment',
        payment_type: 'xykfq',
        pay_installments: 3,
        opcse_cardHolderName: 'DSAD',
        opcse_payCPF: '491-122-534-30',
        opcse_payCNPJ: '',
        bankSelect: 'BOLETO',
        cpf_code: '',
        card_data: 'opcse_0_1_1$EMywkN9dCrDs3DO8LIXPAOlKvc5rTE0T073Cv4MzTiHQRtksf267DSJS4lymHBtMBGmAA22RtmTGgZh/05hPEfhiPvXEqKu+2sGNB/aDdVLCw6+0H+ypWXjwLMPOsLliPpvy58hQ5Oqk8qEeNOrpsGeApnMe6p2tbtv0EgHSyEw=$070GI86vq2DhwypFIhEjii+WJR0nvD9FdCNbzer1jph42/r/mRoX419Vn4rnQKDRfum6uNdnYaK+Kg3LjExadJgVWICM4STZstjThVHqBbzXs582jMlEmjOTspIwNHcAdFErWUpF20e0Ym1aLXyqr17gC8crOHojzK3VVUGilmU='
    }
    let fenqiOptions = {
        uri: paymentUrl,
        method: 'POST',
        form: form,
        headers: headers,
        followAllRedirects: true
    }
    let body = await rp(fenqiOptions);
    return context;
}



module.exports = {
    newUser: newUser,
    userLogin: userLogin,
    addToCart: addToCart,
    placeOrder: placeOrder,
    fenqi: fenqi
}