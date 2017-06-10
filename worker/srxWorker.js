/**
 * Created by 超 on 2017/6/10.
 */
const rp = require('request-promise')
const config = require('../config')
const Promise = require('bluebird')




let fetchingFromSrx = async info => {

    info = {postal : 470117, units : `#08-54`, type : 1}

    let postal = info.postal

    let postalResponse = await rp({uri: `https://www.srx.com.sg/common/sveMobile.agent?limit=5&action=searchWithWalkup&query=${postal}`, json : true, method : 'GET'})

    let buildingNum = postalResponse.data[0].buildingNum

    let unitsInfo = info.units
    let floor = unitsInfo.split('-')[0].replace('#', '')
    let unit = unitsInfo.split('-')[0].replace('#', '')
    let type = unitsInfo.type

    let options = {
        method : 'POST',
        json: true,
        uri : 'https://www.srx.com.sg/common/sveMobile.agent',
        form : {
            action:'getProject',
            postal:postal,
            floor:floor,
            unit:unit,
            type:type,
            userId:1,
            buildingNum:buildingNum,
            typeOfArea:'L'
        }
    }

    let result = await rp(options)
    // let buildingNum = result.data[0].block
    let encryptedId = result.data[0].streetId
    let search = `https://www.srx.com.sg/search/sale/hdb/Bedok+Reservoir+Road/xValuePricing?isPromotion=true&encryptedId=3216&buildingNum=117&postalCode=470117&subType=1&unit=08-54&size=70&externalArea=&propertyType=81&type=1&keywords=117+Bedok+Reservoir+Road+(470117)`
    // console.log(result)
}

// fetchingFromSrx()