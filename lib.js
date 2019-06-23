let chatSocket;
let thisClientId;
let chattingWith;

function connect() {
  if (!window.location.hostname) {
    chatSocket = new WebSocket("ws://127.0.0.1:3000");
  }
  else {
    chatSocket = new WebSocket(location.origin.replace(/^http/, 'ws'));
  }
  chatSocket.onopen = event => {
    // On chatsocket open, loop through all the input textbox
    // and make them enabled except for private chat.
    // Private chat will be enabled whenever someone click on you and vice-versa.
    let inputNodes = document.querySelectorAll('input[type="text"]');
    if (inputNodes.length) {
      inputNodes.forEach(elInput => {
        if (elInput.getAttribute('id') !== 'private-text') {
          elInput.removeAttribute("disabled");
        }
      });
    }
  };

  // On receive message, render these on screen.
  chatSocket.onmessage = event => {
    let msg = JSON.parse(event.data);
    writeMessage(msg);
  };
}

function sendMessage(type, text) {
  var msg = {
    type,
    text,
    date: Date.now()
  };

  if (type === 'private_msg') {
    msg.withId = chattingWith.id;
  }

  // Send the msg object as a JSON-formatted string.
  chatSocket.send(JSON.stringify(msg));
}

/**
 * Renders the message received into browser.
 * 
 * @param {string} msg - the actual message object.
 */
function writeMessage(msg) {
  let text = "", timeStr = new Date(msg.date).toLocaleTimeString(), containerToWrite;

  switch(msg.type) {
    case "new_user":
      containerToWrite = document.getElementById("user-list");
      text = `<b>User ${msg.text}</b> (joined at ${timeStr})<br />`;
      thisClientId = msg.id;
      break;

    case "public_msg":
      containerToWrite = document.getElementById("public-chat");
      if (msg.from !== null) {
        text = `<b>${msg.from.username} - ${msg.text}</b> sent at ${timeStr}<br />`;
      }
      else {
        text = `<b>${msg.text}</b> at ${timeStr}<br />`;
      }
      break;

    case "onlineusers":
      containerToWrite = document.getElementById("user-list");
      let userListText = '', userJoinedAt;
      msg.users.map(user => {
        userJoinedAt = new Date(user.date).toLocaleTimeString();
        if (thisClientId === user.id) {
          userListText += `<b>User ${user.text}</b> (joined at ${userJoinedAt})<br />`;
        }
        else {
          userListText += `<b>User <a href="#" data-id="${user.id}"
            title="Chat with ${user.text}">${user.text}</a></b> (joined at ${userJoinedAt})<br />`;
        }
      });
      containerToWrite.innerHTML = userListText;
      containerToWrite.scrollTop = containerToWrite.scrollHeight;
      break;

    case "start_private_chat_failed":
      containerToWrite = document.getElementById("private-chat");
      containerToWrite.classList.add('error');
      containerToWrite.classList.remove('disabled');
      containerToWrite.innerHTML = 'User left. Private chat failed.';
      setTimeout(() => {
        containerToWrite.innerHTML = '';
        containerToWrite.classList.remove('error');
        containerToWrite.classList.add('disabled');
      }, 2000);
      break;

    case "start_private_chat":
      containerToWrite = document.getElementById("private-chat");
      containerToWrite.classList.remove('disabled');
      document.getElementById("private-text").removeAttribute("disabled");
      chattingWith = {id: msg.with.id, username: msg.with.username};
      containerToWrite.innerHTML = `<div class="header">Your chat with - ${msg.with.username}</div>`;
      break;

    case "private_msg":
      containerToWrite = document.getElementById("private-chat");

      // If the other user has updated name, update the client.
      if (!msg.with.self && msg.with.id === chattingWith.id) {
        containerHeader = document.querySelector("#private-chat .header");
        containerHeader.innerHTML = `Your chat with - ${msg.with.username}`;
      }
      text = `<b>${msg.with.username} - ${msg.text}</b> sent at ${timeStr}<br />`;
      break;
  }
  if (text.length) {
    containerToWrite.innerHTML = containerToWrite.innerHTML + text;
    containerToWrite.scrollTop = containerToWrite.scrollHeight;
  }
}
