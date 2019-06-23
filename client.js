document.addEventListener('DOMContentLoaded', function() {
  // Loop through all the input boxes and add enter key press event listener.
  // After the message is entered, make the textbox blank again.
  let inputNodes = document.querySelectorAll('input[type="text"]');
  if (inputNodes.length) {
    inputNodes.forEach(function(elInput) {
      elInput.addEventListener('keypress', function(e) {
        // Enter key press.
        if (e.keyCode == 13) {
          let msg = elInput.value;
          switch(elInput.getAttribute('id')) {
            case 'name-text':
              sendMessage('username', msg);
              elInput.value = '';
              break;
            case 'private-text':
              sendMessage('private_msg', msg);
              elInput.value = '';
              break;
            case 'public-text':
              sendMessage('public_msg', msg);
              elInput.value = '';
              break;
          }
        }
      });
    });
  }

  document.body.addEventListener('click', function (e) {
    if (e.target &&
      e.target.tagName === 'A' &&
      e.target.closest('#user-list') !== null) {

      e.preventDefault();
      sendMessage('connect_private_chat', e.target.getAttribute('data-id'));
      return false;
    }
  });
});

connect();
