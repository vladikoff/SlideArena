var server = require('./')();
var port = 8081;
server.listen(port);
console.log('Listening on ', port, ' open http://localhost:', port);