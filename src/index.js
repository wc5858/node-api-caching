const http = require('http')
const url = require('url')

const config = require('./config')
const Caching = require('./caching')

let callApi = (request, response) => {
  let url = request.url
  if (Caching.checkRecord(url)) {
    const req = http.request(
      {
        host: config.settings.host,
        path: url,
        headers: request.headers,
        method: request.method,
      },
      res => {
        response.writeHead(res.statusCode, res.headers)
        res.setEncoding('utf8')
        var body = ''
        res.on('data', chunk => {
          body += chunk
        })
        res.on('end', () => {
          Caching.writeCache(url, body,res)
          response.write(body)
          response.end()
        })
      },
    )
    req.on('error', e => {
      console.error(`请求遇到问题：${e.message}，使用缓存数据`)
      Caching.readCache(url, response)
    })
    req.end()
  } else {
    Caching.readCache(url, response)
  }
}

http
  .createServer(function(request, response) {
    let path = url.parse(request.url).pathname
    if (request.method == 'OPTIONS') {
      response.writeHead(200, {
        'Access-Control-Allow-Headers':
          request.headers['access-control-request-headers'],
        'Access-Control-Allow-Methods':
          request.headers['access-control-request-method'],
        'Access-Control-Allow-Origin': request.headers.origin,
      })
      response.end()
    } else {
      callApi(request, response)
    }
  })
  .listen(config.settings.port)
