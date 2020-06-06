// Script for index.html

var chatVars = {
  socketID: ""
};

// On page load completion
$(function() {

  // Hide elements
  $("#pwgate").hide();
  $("#pwgate_enter").css({
    visibility: "hidden",
    opacity: 0
  });
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

  // Change display to password gate
  $("#pwgate").fadeIn(500, function() {
    $("#pwgate").animate({top: "50%"}, 500, function() {
      $("#pwgate_enter").css("visibility", "visible")
      .animate({opacity: 1}, 500, function() {
        $("#pwgate_input").select();
      });
    });
  });

  // Handle password attempt via button
  $("#pwgate_enter").click(function() {
    attemptPassword();
  });

  // Handle password attempt via enter key and remove mismatch outline
  $("#pwgate_input").keypress(function(e) {
    $("#pwgate_input").css("outline", "none");
    if(e.keyCode == 13) {
      attemptPassword();
    }
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

  // Handle passwordConfirm event from server
  socket.on("passwordConfirm", function(data) {
    if(data.pass) {
      // Clear input field
      $("pwgate_input").val("");
      // Change display to name creation
      $("#pwgate").fadeOut(500, function() {
        $("#createname").fadeIn(1000, function() {
          $("#createname").animate({top: "50%"}, 500, function() {
            $("#createname_input").css("visibility", "visible")
            .animate({opacity: 1}, 500, function() {
              $("#createname_input").select();
            });
            $("#createname_enter").css("visibility", "visible")
            .animate({"opacity": 1}, 500);
          });
        });
      });
    } else {
      // Outline input bar red
      $("#pwgate_input").css("outline", "rgba(255, 0, 0, 0.6) solid 2px");
      // Enable input + submission again
      $("#pwgate_enter").prop("disabled", false);
      $("#pwgate_input").prop("readonly", false);
      $("#pwgate_input").select();
    }
  });

  // Handle userAdmit event from server
  socket.on("userAdmit", function(data) {
    // Clear input field
    $("createname_input").val("");
    // Store user info
    chatVars.socketID = data.socketID;
    // Change display to chat
    $("#createname").fadeOut(500, function() {
      $("#chat").fadeIn(500, function() {
        $("#chat_shelf_username").html(data.username);
        $("#chat_shelf_ip").html(data.ip);
        $("#chat_shelf_geo").html(data.geo);
        $("#chat_input_text").select();
      });
    });
  });

  // Handle userJoin event from server
  socket.on("userJoin", function(data) {
    $("#chat_shelf_usercount").html("Users: " + data.count);
    displayUserJoin(data.username);
  });

  // Handle userLeave event from server
  socket.on("userLeave", function(data) {
    $("#chat_shelf_usercount").html("Users: " + data.count);
    displayUserLeave(data.username);
  });

  // Handle userMessageToClient event from server
  socket.on("userMessageToClient", function(data) {
    if(data.socketID == chatVars.socketID) {
      displayMessageOut(data.message);
    } else {
      displayMessageIn(data.username, data.message);
    }
  });

});


// Attempt a password
function attemptPassword() {
  if($("#pwgate_input").val()) {
    $("#pwgate_enter").prop("disabled", true);
    $("#pwgate_input").prop("readonly", true);
    socket.emit("passwordAttempt", {
      password: $("#pwgate_input").val()
    });
  }
}

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

// Display user join
function displayUserJoin(username) {
  $("#chat_log").append(
    '<div class="chat_log_userupdate"><p class="chat_log_userupdate_text">' + username + ' has joined.</p></div>'
  );
}

// Display user leave
function displayUserLeave(username) {
  $("#chat_log").append(
    '<div class="chat_log_userupdate"><p class="chat_log_userupdate_text">' + username + ' has left.</p></div>'
  );
}
