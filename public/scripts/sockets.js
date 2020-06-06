// General client side code for real-time client-server communication

// Initialize socket
var socket = io();

// Handle connection error
socket.on("connect_failed", function() {
  var body = document.getElementsByTagName("body")[0];
  body.innerHTML = "";
  body.write("<p>Connection error.</p>");
});
