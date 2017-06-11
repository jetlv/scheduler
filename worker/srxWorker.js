/**
 * Created by 超 on 2017/6/10.
 */
const rp = require('request-promise')
const config = require('../config')
const Promise = require('bluebird')
const fs = require('fs')
const webdriver = require('selenium-webdriver')
const by = webdriver.By
const proxy = require('selenium-webdriver/proxy')
const cheerio = require('cheerio')

let fetchingFromSrx = async info => {

    // info = {postal: 470117, units: `#08-54`, type: 1}

    let postal = info.postal
    let postalResponse = await rp({
        uri: `https://www.srx.com.sg/common/sveMobile.agent?limit=5&action=searchWithWalkup&query=${postal}`,
        json: true,
        method: 'GET'
    })
    /** Above request response example
     {
	"data": [{
		"address": "117 Bedok Reservoir Road (470117)",
		"buildingName": "",
		"buildingNum": "117",
		"buildingType": "",
		"latitude": 1.33141328234506,
		"longitude": 103.908688646963,
		"postalCode": 470117,
		"streetName": "Bedok Reservoir Road"
	}],
	"result": "ok"
}
     */

    let postalResult = postalResponse.data[0]
    let unitsInfo = info.units
    let floor = unitsInfo.split('-')[0].replace('#', '')
    let unit = unitsInfo.split('-')[1].replace('#', '')
    let type = unitsInfo.type


    let getAddrssOptions = {
        uri: 'https://www.srx.com.sg/srx/listing/getAddressByPostalCode/redefinedSearch.srx',
        method: 'POST',
        form: {
            skipCommercial: `Y`,
            postalCode: 470117,
            buildingNum: 117,
        },
        json: true
    }
    let getAddressResponse = await rp(getAddrssOptions)
    let getAddressResult = getAddressResponse.data
    console.log(`getAddressResult is ${JSON.stringify(getAddressResult)}`)
    /** Above request response example
     {
	"data": {
		"buildingKey": "",
		"buildingName": "",
		"buildingNum": "117",
		"byBuildingKey": false,
		"district": 0,
		"hdbTownId": 0,
		"possiblyNoUnit": false,
		"postalCode": 470117,
		"propertySubType": 0,
		"propertySubTypeList": [1,
		2],
		"propertyType": 1,
		"streetKey": "BED0018",
		"streetName": "Bedok Reservoir Road",
		"typeOfArea": "LAND"
	}
}

     */



    let options = {
        method: 'POST',
        json: true,
        uri: 'https://www.srx.com.sg/common/sveMobile.agent',
        form: {
            action: 'getProject',
            postal: postal,
            floor: floor,
            unit: unit,
            type: type,
            userId: 1,
            buildingNum: postalResult.buildingNum,
            typeOfArea: getAddressResult.typeOfArea.substring(0, 1)
        }
    }

    let getSizeResponse = await rp(options)
    /**
     above request response example
     "data": [{
		"block": "117",
		"building": "",
		"gfa": 0,
		"lastConstructed": "1985-07-01",
		"name": "Bedok Reservoir Road (HDB 3 Rooms)",
		"pesSize": 0,
		"pesSizeVerified": false,
		"size": 70,
		"street": "Bedok Reservoir Road",
		"streetId": 3216,
		"tenure": "",
		"type": 1,
		"typeOfArea": "LAND"
	}],
     "result": "ok"
     */
    let getSizeResult = getSizeResponse.data[0]
    console.log(`getSizeResult is ${JSON.stringify(getSizeResult)}`)
    let encryptedId = getSizeResult.streetId
    let calculateUrl = `https://www.srx.com.sg/search/sale/hdb/Bedok+Reservoir+Road/xValuePricing?
    isPromotion=true
    &encryptedId=${encryptedId}
    &buildingNum=${postalResult.buildingNum}
    &postalCode=${postal}
    &subType=${getAddressResult.propertySubTypeList[1]}
    &unit=${floor}-${unit}
    &size=${getSizeResult.size}
    &externalArea=
    &propertyType=
    &type=${getSizeResult.type}
    &keywords=${postalResult.address}`

    let sizeMap = {1 : 70, 2: 100, 3: 115}
    let sqft = ''
    if (getSizeResult.size == 0) {
        console.log(parseInt(info.type))
        console.log(sizeMap[parseInt(info.type)])
        sqft = parseInt(sizeMap[parseInt(info.type)] * 10.763)
    } else {
        sqft = parseInt(getSizeResult.size * 10.763)
    }
    let finalForm = {
        id: getSizeResult.streetId,
        postalCode: postal,
        floorNum: floor,
        subType: getAddressResult.propertySubTypeList[1],
        size: sqft,
        unitNum: unit,
        type: `S`,
        cdPlatform: 2,
        cdApp: 2,
        buildingNum: postalResult.buildingNum
    }

    let finalPostUrl = 'https://www.srx.com.sg/srx/listings/promotionGetXValue/redefinedSearch.srx'

    let finalOptions = {
        uri: finalPostUrl,
        form: finalForm,
        method: 'POST',
        json: true
    }

    let finalResult = await rp(finalOptions)
    console.log(finalResult)
    return finalResult.xValue
    /**
     * POST EXAMPLE
     id:3216
     postalCode:470117
     floorNum:08
     subType:1
     size:753
     unitNum:54
     type:S
     cdPlatform:2
     cdApp:2
     landedXValue:null
     landType:null
     tenure:null
     builtYear:null
     buildingNum:117
     pesSize:
     builtSizeGfa:null
     */

    // let search = `https://www.srx.com.sg/search/sale/hdb/Bedok+Reservoir+Road/xValuePricing?
    // isPromotion=true
    // &encryptedId=3216
    // &buildingNum=117
    // &postalCode=470117
    // &subType=1
    // &unit=08-54
    // &size=70
    // &externalArea=&propertyType=81&type=1&keywords=117+Bedok+Reservoir+Road+(470117)`


}

let fetchingViaBrowser = async(info) => {

    //info = {postal: 470117, units: `#08-54`, type: 1}

    let postal = info.postal
    let unitsInfo = info.units
    let floor = unitsInfo.split('-')[0].replace('#', '')
    let unit = unitsInfo.split('-')[1].replace('#', '')
    let type = unitsInfo.type


    let driver = new webdriver.Builder().forBrowser('chrome').setProxy(proxy.manual({http: '127.0.0.1:1100'})).usingServer('http://45.63.25.194:5666/wd/hub').build()
    // let driver = new webdriver.Builder().forBrowser('chrome').build()
    await driver.get(`https://www.srx.com.sg/xvalue-pricing`)
    await driver.findElement(by.xpath(`//input[@name='xValueTypeahead']`)).sendKeys(postal)
    await driver.wait(async()=> {
        let element = await driver.findElement(by.css(`.tt-dataset-xValueSuggestions`))
        let value = await element.getText()
        return value
    })
    await driver.findElement(by.css(`.tt-dataset-xValueSuggestions`)).click()
    await driver.findElement(by.xpath(`//select[@name='xValuePropertyType']`)).click()
    await driver.findElement(by.xpath('//select[@name="xValuePropertyType"]/option[@value="1"]')).click()
    await driver.findElement(by.xpath(`//input[@name='xValueFloorNo']`)).sendKeys(floor)
    await driver.findElement(by.xpath(`//input[@name='xValueUnitNo']`)).sendKeys(unit)
    await driver.findElement(by.css(`#xValueGetSizeButton`)).click()
    // await driver.wait(async()=> {
    //     let element = await driver.findElement(by.css(`#xValueSizeInputID`))
    //     let value = await element.getText()
    //     return value
    // })
    await Promise.delay(2000)
    await driver.findElement(by.css(`#calculateSubmit`)).click()
    await driver.wait(async()=> {
        let element = await driver.findElement(by.css(`#xValueCalculated`))
        let value = await element.getText()
        return value
    })
    let scrapedValue = await driver.findElement(by.css(`#xValueCalculated`)).getText()
    await driver.quit()
    return scrapedValue
}

module.exports = {
    fetchingViaBrowser: fetchingViaBrowser,
    fetchingFromSrx: fetchingFromSrx
}