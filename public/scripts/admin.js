// Script for admin/index.html

// On page load completion
$(function() {

  // Handle force reload button
  $("#forcereload_apply").click(sendForceReload);

});

// Force reload for all clients connected via socket
function sendForceReload() {
  socket.emit("forceReloadReq");
}
