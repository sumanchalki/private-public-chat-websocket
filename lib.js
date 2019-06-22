let chatSocket;

function connect() {
  chatSocket = new WebSocket("ws://127.0.0.1:2000");

  chatSocket.onopen = function (event) {
    // On chatsocket open, loop through all the inputbox and make them enabled
    // except for private chat. Private chat will be enabled whenever someone click on you and vice-versa.
    let input_nodes = document.querySelectorAll('input[type="text"]');
    if (input_nodes.length) {
      input_nodes.forEach(function(el_input) {
        el_input.removeAttribute("disabled");
      });
    }
  };

  // On receive message render these on screen.
  chatSocket.onmessage = function(event) {
    let msg = JSON.parse(event.data);
    let time = new Date(msg.date);
  
    writeMessage(msg.type, msg.text, time);
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
 * @param {string} type - type of message.
 * @param {string} msg - the actual message.
 * @param {Date} time - the time when the message is generated.
 */
function writeMessage(type, msg, time) {
  let text = "", timeStr = time.toLocaleTimeString(), containerToWrite;
  switch(type) {
    case "new_user":
      containerToWrite = document.getElementById("public-chat");
      text = `<b>User <em>${msg}</em> joined at ${timeStr}.</b><br />`;
      break;
    case "private_msg":
      containerToWrite = document.getElementById("private-chat");
      text = `<b>${msg}</b> sent at ${timeStr}<br />`;
      break;
    case "public_msg":
        containerToWrite = document.getElementById("public-chat");
        text = `<b>${msg}</b> sent at ${timeStr}<br />`;
      break;
    /*case "onlineusers":
      var ul = "";
      for (i=0; i < msg.users.length; i++) {
        ul += msg.users[i] + "<br>";
      }
      document.getElementById("userlistbox").innerHTML = ul;
      break;*/
  }
  if (text.length) {
    containerToWrite.innerHTML = containerToWrite.innerHTML + text;
    containerToWrite.scrollTop = containerToWrite.scrollHeight;
  }
}
