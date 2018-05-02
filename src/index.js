const http = require('http')
const url = require('url')

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
      const req = http.request(
        {
          host: 'api.ethfrog.local',
          path: request.url,
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
            response.write(body)
            response.end()
          })
        },
      )
      req.on('error', e => {
        console.error(`请求遇到问题: ${e.message}`)
        response.end()
      })
      req.end()
      
    }
  })
  .listen(8777)
