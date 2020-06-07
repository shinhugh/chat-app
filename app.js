// Server parameters
const port = 80;
const path_public = "/home/haru/Documents/chat-app/public"

// Node modules
const express = require("express");
const app = express();
const fetch = require("node-fetch");
const fs = require("fs");

/*
// SSL Certificate
const credentials = {
  key: fs.readFileSync("key.pem"),
  cert: fs.readFileSync("cert.pem")
};
*/

// Node modules
const http = require("http").Server(app);
const io = require("socket.io") (http);

// Default room
const room_name_default = "room-default";
const room_password_default = "0000";

// Number of connected clients
var socket_count = 0;

// Number of verified clients
var verified_count = 0;

// Verified clients' information
var verified = new Map();

// Handle connection start
io.on("connection", function(socket) {

  // Update connection count
  socket_count++;

  // Log
  console.log("New connection with:    "
  + socket.request.connection.remoteAddress);
  console.log("Connection count:       " + socket_count);
  fetch("http://ip-api.com/json/" + socket.request.connection.remoteAddress)
  .then(res => {
    return res.json()
  })
  .then(obj => {
    console.log(obj);
  });

  // Handle connection end
  socket.on("disconnect", function() {
    // Update connection count
    socket_count--;
    // Broadcast closed connection notification
    // Note: Move this if leaving room without disconnecting is possible
    if(verified.has(socket.id)) {
      // Broadcast user leave notification if user was in room
      if(verified.get(socket.id).in_room) {
        io.sockets.in(room_name_default).emit("userLeave", {
          socketID: socket.id,
          username: verified.get(socket.id).username,
          count: verified_count
        });
      }
      // Revoke verification
      verified.delete(socket.id);
      // Update verified count
      verified_count--;
    }
    // Log
    console.log("Closed connection with: "
    + socket.request.connection.remoteAddress);
    console.log("Connection count:       " + socket_count);
  });

  // Handle passwordAttempt event from client
  socket.on("passwordAttempt", function(data) {
    if(data.password == room_password_default) {
      // Add client to map of verified clients
      verified.set(socket.id, {
        in_room: false,
        username: "",
        ip: socket.request.connection.remoteAddress,
        geo: "Geolocation unavailable"
      });
      // Update verified count
      verified_count++;
      // Geolocation
      fetch("http://ip-api.com/json/" + socket.request.connection.remoteAddress)
      .then(res => {
        return res.json()
      })
      .then(obj => {
        if(obj.status == "success") {
          verified.get(socket.id).geo = obj.city + ", " + obj.region + ", "
          + obj.country;
        }
      });
      // Notify pass
      socket.emit("passwordConfirm", {
        pass: true
      });
      // Log
      console.log("Password match:         "
      + socket.request.connection.remoteAddress);
    } else {
      // Notify fail
      socket.emit("passwordConfirm", {
        pass: false
      });
      // Log
      console.log("Password mismatch:      "
      + socket.request.connection.remoteAddress);
    }
  });

  // Handle nameCreation event from client
  socket.on("nameCreation", function(data) {
    // Verify that this user has passed password check
    if(verified.has(socket.id)) {
      // Add socket to default room
      socket.join(room_name_default);
      verified.get(socket.id).in_room = true;
      // Add username to client's information object
      verified.get(socket.id).username = data.username;
      // Notify name confirmation
      socket.emit("userAdmit", {
        socketID: socket.id,
        username: data.username,
        ip: verified.get(socket.id).ip,
        geo: verified.get(socket.id).geo
      });
      // Broadcast user join notification
      io.sockets.in(room_name_default).emit("userJoin", {
        socketID: socket.id,
        username: data.username,
        count: verified_count
      });
    }
  });

  // Handle userMessageToServer event from client
  socket.on("userMessageToServer", function(data) {
    // Broadcast message to all members in room
    io.sockets.in(room_name_default).emit("userMessageToClient", {
      socketID: socket.id,
      username: verified.get(socket.id).username,
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
  // Log
  console.log("Listening on port " + port);
});
