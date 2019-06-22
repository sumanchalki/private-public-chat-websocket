const WebSocket = require('ws');
const uuid = require('uuid');
const wss = new WebSocket.Server({port: 2000});

wss.on('connection', function (ws) {
  ws.id = uuid.v4();

  console.log(ws.id);
  wss.clients.forEach(function each(client) {
      console.log('Client.ID: ' + client.id);
  });

  ws.send(JSON.stringify({type:'new_user', text: 'Anonymous', date: Date.now()}));

  broadCastThis({type:'public_msg', text: 'Someone joined!', date: Date.now()});

  ws.on('message', function (message) {
    let messageParsed = JSON.parse(message);
    console.log(messageParsed);
    if (messageParsed.type === 'private_msg') {
      ws.send(message);
    }
    else if(messageParsed.type === 'public_msg' || messageParsed.type === 'username') {
      broadCastThis(messageParsed);
    }
  });
});

function broadCastThis(message) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}
