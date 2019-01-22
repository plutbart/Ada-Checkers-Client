const urlBase = "http://192.168.0.87:3333";


function sendRequest(type, url, data, callback, onFail) {
  var request = new XMLHttpRequest();
  var response;

  request.open(type, url, true);
  request.setRequestHeader("Content-type", "application/json");
  request.send(data!==null ? JSON.stringify(data) : null);

  request.onreadystatechange = function() {
    if (request.readyState==4 && request.status==200) {
      callback(JSON.parse(request.responseText))
    }
    else if (request.status!=200){
      onFail()
    }
  }

  request.timeout = 5000;
  request.ontimeout = function (e) {
    onFail()
  };
}

export function getNewGame(callback, onFail) {
  const url = `${urlBase}/game`;
  sendRequest('GET', url, null, callback, onFail);
}

export function joinNewGame(gameID, callback, onFail) {
  const url = `${urlBase}/game/${gameID}`;
  sendRequest('GET', url, null, callback, onFail);
}

export function postMove(data, gameID, callback, onFail) {
  const url = `${urlBase}/game/${gameID}/move`;
  sendRequest('POST',url, data, callback, onFail);
}

export function getGameState(gameID, callback, onFail) {
  const url = `${urlBase}/game/${gameID}/state`;
  sendRequest('GET', url, null, callback, onFail);
}
