document.addEventListener("DOMContentLoaded", function() {
  let input_nodes = document.querySelectorAll('input[type="text"]');
  if (input_nodes.length) {
    input_nodes.forEach(function(el_input) {
      el_input.addEventListener('keypress', function(e) {
        if (e.keyCode == 13) {
          let msg = el_input.value;
          switch(el_input.getAttribute('id')) {
            case 'name-text':
              sendMessage('username', msg);
              el_input.value = "";
              break;
            case 'private-text':
              sendMessage('private_msg', msg);
              el_input.value = "";
              break;
            case 'public-text':
              sendMessage('public_msg', msg);
              el_input.value = "";
              break;
          }
        }
      });
    });
  }
});

connect();
