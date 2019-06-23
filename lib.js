let chatSocket;
let thisClientId;

function connect() {
  chatSocket = new WebSocket("ws://127.0.0.1:2000");

  chatSocket.onopen = function (event) {
    // On chatsocket open, loop through all the inputbox
    // and make them enabled except for private chat.
    // Private chat will be enabled whenever someone click on you and vice-versa.
    let input_nodes = document.querySelectorAll('input[type="text"]');
    if (input_nodes.length) {
      input_nodes.forEach(function(el_input) {
        if (el_input.getAttribute('id') !== 'private-text') {
          el_input.removeAttribute("disabled");
        }
      });
    }
  };

  // On receive message render these on screen.
  chatSocket.onmessage = function(event) {
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

    case "private_msg":
      containerToWrite = document.getElementById("private-chat");
      text = `<b>${msg.text} - ${msg.username}</b> sent at ${timeStr}<br />`;
      break;

    case "public_msg":
      containerToWrite = document.getElementById("public-chat");
      if (msg.username !== null) {
        text = `<b>${msg.text} - ${msg.username}</b> sent at ${timeStr}<br />`;
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
          userListText += `<b>User <a href="#" data-id="${user.id}" title="Chat with ${user.text}">${user.text}</a></b> (joined at ${userJoinedAt})<br />`;
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
      containerToWrite.innerHTML = `<div class="header">Your chat with - ${msg.with.username}</div>`;
      break;

    //start_private_chat
  }
  if (text.length) {
    containerToWrite.innerHTML = containerToWrite.innerHTML + text;
    containerToWrite.scrollTop = containerToWrite.scrollHeight;
  }
}
