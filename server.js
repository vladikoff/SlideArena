var server = require('./slideserver')()
var port = 8095
server.listen(port)
console.log('Listening on ', port, ' open http://localhost:', port)