// Script for index.html

var chatVars = {
  socketID: "",
  username: ""
};

// On page load completion
$(function() {

  // Hide elements
  $("#createname").hide();
  $("#createname_input").css({
    visibility: "hidden",
    opacity: 0
  });
  $("#createname_enter").css({
    visibility: "hidden",
    opacity: 0
  });
  $("#chat").hide();

  // Make base container visible
  document.getElementById("base").removeAttribute("hidden");

  // Eye candy
  $("#createname").fadeIn(1000, function() {
    $("#createname").animate({top: "50%"}, 500, function() {
      $("#createname_input").css("visibility", "visible")
      .animate({"opacity": 1}, 500, function() {
        $("#createname_input").select();
      });
      $("#createname_enter").css("visibility", "visible")
      .animate({"opacity": 1}, 500);
    });
  });

  // Handle name creation via button
  $("#createname_enter").click(function() {
    createName();
  });

  // Handle name creation via enter key
  $("#createname_input").keypress(function(e) {
    if(e.keyCode == 13) {
      createName();
    }
  });

  // Handle message sending via button
  $("#chat_input_thumb_send").click(function() {
    sendMessage();
  });

  // Handle message sending via enter key
  $("#chat_input_text").keypress(function(e) {
    if(e.keyCode == 13 && !e.shiftKey) {
      sendMessage();
      e.preventDefault();
    }
  });

  // Handle enterChat event from server
  socket.on("enterChat", function(data) {
    chatVars.socketID = data.socketID;
    chatVars.username = data.username;
    // Change display to chat
    $("#createname").fadeOut(1000, function() {
      $("#chat").fadeIn(1000, function() {
        $("#chat_input_text").select();
      });
    });
  });

  // Handle userConnect event from server
  socket.on("userConnect", function(data) {
    console.log(data.username + " has connected. Count: " + data.count);
  });

  // Handle userDisconnect event from server
  socket.on("userDisconnect", function(data) {
    console.log(data.username + " has disconnected. Count: " + data.count);
  });

  // Handle userMessageToClient event from server
  socket.on("userMessageToClient", function(data) {
    if(data.socketID == chatVars.socketID) {
      displayMessageOut(data.message);
    }
    else {
      displayMessageIn(data.username, data.message);
    }
  });

});


// Submit user name to server and disable name input
function createName() {
  if($("#createname_input").val()) {
    $("#createname_enter").prop("disabled", true);
    $("#createname_input").prop("readonly", true);
    socket.emit("nameCreation", {
      username: $("#createname_input").val()
    });
  }
}

// Send new message
function sendMessage() {
  if($("#chat_input_text").val()) {
    socket.emit("userMessageToServer", {
      username: chatVars.username,
      message: $("#chat_input_text").val()
    });
    $("#chat_input_text").val("");
  }
}

// Display new incoming message
function displayMessageIn(name, message) {
  $("#chat_log").append(
    '<div class="chat_log_message_in"><div class="chat_log_message_meta"><p class="chat_log_message_meta_user">' + name + '</p></div><div class="chat_log_message_content_in"><pre class="chat_log_message_content_line">' + message + '</pre></div></div>'
  );
}

// Display new outgoing message
function displayMessageOut(message) {
  $("#chat_log").append(
    '<div class="chat_log_message_out"><div class="chat_log_message_content_out"><pre class="chat_log_message_content_line">' + message + '</pre></div></div>'
  );
}
