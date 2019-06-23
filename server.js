const http = require("http");
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');
const uuid = require('uuid');
const wss = new WebSocket.Server({port: 8080});
const currentPrivateChat = [];

// Create a static server to serve client files.
http.createServer(function(req, res) {
  if (req.url === '/') {
    fs.readFile('./index.html', 'UTF-8', (err, html) => {
      res.writeHead(200, {"Content-Type": "text/html"});
      res.end(html);
    });
  }
  else if (req.url.match(/.css$/)) {
    const cssStream = fs.createReadStream(path.join(__dirname, req.url), 'UTF-8');
    res.writeHead(200, {"Content-Type": "text/css"});
    cssStream.pipe(res);
  }
  else if (req.url.match(/.js$/)) {
    const jsStream = fs.createReadStream(path.join(__dirname, req.url), 'UTF-8');
    res.writeHead(200, {"Content-Type": "application/javascript"});
    jsStream.pipe(res);
  }
}).listen(80);

// TODO: send to client only if there is any change.
setInterval(updateOnlineUsers, 3000);

wss.on('connection', ws => {
  const currentTime = Date.now();

  // Unique id is assigned, set username to Anonymous and set login time
  // to each client after the connection is made.
  Object.assign(ws, {id: uuid.v4(), username: 'Anonymous', date: currentTime});

  // Send the event back to client so it can display a new user is added.
  ws.send(JSON.stringify({type:'new_user', text: 'Anonymous', id: ws.id, date: currentTime}));

  // Also send a broadcast message so other users can get notified.
  broadCastThis({type:'public_msg', text: 'Someone just joined!', from: null, date: currentTime});

  ws.on('message', message => {
    let messageParsed = JSON.parse(message);
    console.log(messageParsed);

    if (messageParsed.type === 'private_msg') {
      // Get fromClient and toClient.
      fromClient = findClientById(ws.id);
      toClient = findClientById(messageParsed.withId);
      delete messageParsed.withId;

      if (typeof toClient === 'undefined' ||
        toClient.readyState !== WebSocket.OPEN ||
        typeof fromClient === 'undefined' ||
        fromClient.readyState !== WebSocket.OPEN
      ) {
        return;
      }

      // Send private chat message to toClient.
      Object.assign(messageParsed, {with: {id: fromClient.id, username: fromClient.username, self: false}});
      toClient.send(JSON.stringify(messageParsed));

      // Send private chat message to fromClient.
      Object.assign(messageParsed, {with: {id: toClient.id, username: 'You', self: true}});
      fromClient.send(JSON.stringify(messageParsed));
    }
    // Public msg should be broadcasted.
    else if(messageParsed.type === 'public_msg') {
      Object.assign(messageParsed, {from: {id: ws.id, username: ws.username}});
      broadCastThis(messageParsed);
    }
    else if(messageParsed.type === 'username') {
      // Update username for the client.
      ws.username = messageParsed.text;
    }
    else if(messageParsed.type === 'connect_private_chat') {
      connectToClient(ws.id, messageParsed.text);
    }
  });
});

// Broadcast this message by sending it to all the clients.
function broadCastThis(message) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

function findClientById(id) {
  let clientFound;
  wss.clients.forEach(client => {
    if (client.id === id && client.readyState === WebSocket.OPEN) {
      clientFound = client;
    }
  });

  return clientFound;
}

// Update online users list, specially if someone closed the chat window.
function updateOnlineUsers() {
  const message = {type: 'onlineusers', users: []};

  // Create a list of all users.
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      message.users.push({id: client.id, text: client.username, date: client.date});
    }
  });

  // Send the list to all users.
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

function connectToClient(fromId, toId) {
  let fromClient, toClient;

  // Get fromClient and toClient.
  fromClient = findClientById(fromId);
  toClient = findClientById(toId);

  if (fromClient.readyState !== WebSocket.OPEN && toClient.readyState !== WebSocket.OPEN) {
    console.log('Private chat failed as both clients left.');
  }
  else if (fromClient.readyState === WebSocket.OPEN && toClient.readyState !== WebSocket.OPEN) {
    fromClient.send(JSON.stringify({type: 'start_private_chat_failed'}));
  }
  else if (fromClient.readyState === WebSocket.OPEN && toClient.readyState === WebSocket.OPEN) {
    // Send private chat initiate message to toClient.
    let message = {type: 'start_private_chat', with: {id: fromClient.id, username: fromClient.username}};
    toClient.send(JSON.stringify(message));

    // Send private chat initiate message to fromClient.
    message = {type: 'start_private_chat', with: {id: toClient.id, username: toClient.username}};
    fromClient.send(JSON.stringify(message));

    currentPrivateChat.push({user1Id: fromClient.id, user2Id: toClient.id});
  }
}
