const WebSocket = require('ws');
const uuid = require('uuid');
const wss = new WebSocket.Server({port: 2000});

wss.on('connection', function (ws) {
  // Unique id is assigned to each client after the connection is made.
  ws.id = uuid.v4();

  wss.clients.forEach(function each(client) {
      console.log('Client.ID: ' + client.id);
  });

  // Send the event back to client so it can display a new user is added.
  ws.send(JSON.stringify({type:'new_user', text: 'Anonymous', date: Date.now()}));

  // Also send a broadcast message so other users can get notified.
  broadCastThis({type:'public_msg', text: 'Someone joined!', date: Date.now()});

  ws.on('message', function (message) {
    let messageParsed = JSON.parse(message);
    console.log(messageParsed);
    // Check the message type, if it is public msg or username is updated, broadcast it.
    if (messageParsed.type === 'private_msg') {
      ws.send(message);
    }
    else if(messageParsed.type === 'public_msg' || messageParsed.type === 'username') {
      broadCastThis(messageParsed);
    }
  });
});

// Broadcast this message by sending it to all the clients.
function broadCastThis(message) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}
