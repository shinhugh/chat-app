// Server parameters
var port = 80;
var path_public = "/home/haru/Documents/chat-app/public"

// Node modules
var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io") (http);

// Number of connected clients
var client_count = 0;

// Handle connection start
io.on("connection", function(socket) {

  client_count++;

  // Broadcast new connection notification
  io.sockets.in("room-default").emit("userConnect", {
    socketID: socket.id,
    username: "User",
    count: client_count
  });
  console.log("New connection with:    "
  + socket.request.connection.remoteAddress);
  console.log("Connection count:       " + client_count);

  // Handle connection end
  socket.on("disconnect", function() {
    client_count--;
    // Broadcast closed connection notification
    io.sockets.in("room-default").emit("userDisconnect", {
      socketID: socket.id,
      username: "User",
      count: client_count
    });
    console.log("Closed connection with: "
    + socket.request.connection.remoteAddress);
    console.log("Connection count:       " + client_count);
  });

  // Add socket to room
  socket.join("room-default");

  // Handle nameCreation
  socket.on("nameCreation", function(data) {
    socket.emit("enterChat", {
      socketID: socket.id,
      username: data.username
    });
  });

  // Handle userMessageToServer
  socket.on("userMessageToServer", function(data) {
    io.sockets.in("room-default").emit("userMessageToClient", {
      socketID: socket.id,
      username: data.username,
      message: data.message
    });
  });

});


// Serve static content
app.use(express.static("public"));

// Serve main page
app.get("/", function(req, res) {
  res.sendFile(path_public + "/index.html");
});

// Listen for requests from clients
http.listen(port, "0.0.0.0", function() {
  console.log("Listening on port " + port);
});
