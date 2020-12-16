const SOCKET_TAG = {
  REQUEST_USER_DISCONNECT: "request_user_disconnect",
  REQUEST_SEND_MESSAGE: "request_send_message",
  REQUEST_JOIN_GAME: "request_join_game",
  RESPONSE_UPDATE_USER_ONLINE: "response_update_user_online",
  RESPONSE_SEND_MESSAGE: "response_send_message",
};

const TAG = { ...SOCKET_TAG };

module.exports = TAG;
