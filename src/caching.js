const fs = require('fs')
const config = require('./config')

/**
 * @description 对需要转义的正则字符进行处理，返回一个数组
 * @param {Object} charsObj
 * @returns {Array} 转义后的字符串数组
 */
let escapingChars = charsObj =>
  Object.keys(charsObj).map(
    v => ('*.?+$^[](){}|\\/'.indexOf(v) > -1 ? `\\${v}` : v),
  )

/**
 * @description 将url编码为文件名
 * @param {String} url
 * @returns {String} 文件名
 */
let encodeFileName = url => {
  let reg = new RegExp(
    `(${escapingChars(config.disabledChars).join('|')})`,
    'g',
  )
  return url.replace(reg, ($0, $1) => config.disabledChars[$1]) + '.txt'
}

// 保存上次写每个文件的时间
let record = {}

let saveRecord = () => {
  fs.writeFile('../data/record.txt', JSON.stringify(record), err => {
    if (err) throw err
    console.log('记录保存成功！')
  })
}

let readRecord = () => {
  fs.readFile('../data/record.txt', (err, data) => {
    if (err) throw err
    record = JSON.parse(data)
    console.log('记录读取成功！')
  })
}

if (config.settings.readRecord) readRecord()

let getFileName = url => record[url].fileName

let writeRecord = (url, status, headers) => {
  record[url] = {
    time: new Date().getTime(),
    fileName: encodeFileName(url),
    status: status,
    headers: headers,
  }
  if (config.settings.saveRecord) saveRecord()
}

/**
 * @description 检查是否需要进行写入
 * @param {String} url
 */
module.exports.checkRecord = url => {
  return (
    (record.hasOwnProperty(url) &&
      new Date().getTime() - record[url].time >
        config.settings.cachingInterval * 1000) ||
    !record.hasOwnProperty(url)
  )
}

/**
 * @description 写入缓存
 * @param {String} url
 * @param {String} data
 * @param {Object} res
 */
module.exports.writeCache = (url, data, res) => {
  writeRecord(url, res.statusCode, res.headers)
  fs.writeFile('../data/' + getFileName(url), data, err => {
    if (err) throw err
    console.log(`data from ${url} has been saved!`)
  })
}

/**
 * 读缓存
 * @param {String} url 
 * @param {Object} response 
 */
module.exports.readCache = (url, response) => {
  fs.readFile('../data/' + getFileName(url), (err, data) => {
    if (err) throw err
    console.log(`data from ${url} has been read!`)
    response.writeHead(record[url].status, record[url].headers)
    response.write(data)
    response.end()
  })
}
