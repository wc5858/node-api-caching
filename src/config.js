//制定编码url时须转换的字符
module.exports.disabledChars = {
  '/': '.',
  '?': '$',
}

module.exports.settings = {
  host: 'api.ethfrog.local',
  port: 8777,
  cachingInterval: 300, // 指定缓存时间间隔，单位：秒
  saveRecord: true, // 是否保存接口访问记录
  readRecord: true, // 启动时是否读取访问记录
}
