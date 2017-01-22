var request = require('request');
var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider(process.env.ETHEREUM_RPC_URL));
var _ = require('lodash');

var WebSocketServer = require('websocket').server;
var http = require('https');
 
var server = http.createServer({
  ssl: true,
}, function(request, response) {
    response.writeHead(404);
    response.end();
});
server.listen(process.env.PORT, function() {
    console.log((new Date()) + ' Server is listening on port 8080');
});
 
wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
});

wsServer.on('request', function(request) {
  var id = setInterval(function() {
    connection.sendUTF(JSON.stringify({
      event: "heartbeat",
      date: new Date()
    }))
  }, 1000);
    var connection = request.accept('ethereum', request.origin);
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            handleMessage(message.utf8Data, connection);
        }
    });
    connection.on("close", function() {
      console.log("websocket connection close")
      clearInterval(id)
    })
});

function handleMessage(message, connection) {
  message = JSON.parse(message);
  switch (message.event) {
    case 'subscribe':
      var Contract = web3.eth.contract(message.abi);
      var contract = Contract.at(message.address);
      contract.allEvents({
        fromBlock: 0,
        toBlock: 'latest'}).watch((error, data) => {
          if(error) {
            console.log(error);
          } else {
            connection.sendUTF(JSON.stringify({
              event: "event",
              data: data
            }));
          }
        });

        connection.sendUTF(JSON.stringify({event: 'subscribed'}))
    default:
  }
}
