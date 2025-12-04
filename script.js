let localConnection;
let dataChannel;

document.getElementById("hostBtn").onclick = async () => {
  const username = document.getElementById("username").value || "Host";
  
  localConnection = new RTCPeerConnection();

  dataChannel = localConnection.createDataChannel("chat");
  dataChannel.onmessage = (e) => addMessage(e.data);
  
  const offer = await localConnection.createOffer();
  await localConnection.setLocalDescription(offer);

  // This is your "room code" — copy it and send to friends
  alert(JSON.stringify(offer));
  
  // Wait for friend’s answer to connect
  localConnection.ondatachannel = (event) => {
    const receiveChannel = event.channel;
    receiveChannel.onmessage = (e) => addMessage(e.data);
  };
  
  document.getElementById("room").style.display = "block";
};

document.getElementById("joinBtn").onclick = async () => {
  const answerStr = prompt("Paste host's code:");
  const answer = JSON.parse(answerStr);

  const username = document.getElementById("username").value || "Guest";

  localConnection = new RTCPeerConnection();

  localConnection.ondatachannel = (event) => {
    dataChannel = event.channel;
    dataChannel.onmessage = (e) => addMessage(e.data);
  };

  await localConnection.setRemoteDescription(answer);
  const answerDesc = await localConnection.createAnswer();
  await localConnection.setLocalDescription(answerDesc);

  alert(JSON.stringify(answerDesc));

  document.getElementById("room").style.display = "block";
};

function sendMsg() {
  const msgInput = document.getElementById("msg");
  const msg = msgInput.value;
  if(msg && dataChannel) {
    dataChannel.send(msg);
    addMessage("Me: " + msg);
  }
  msgInput.value = "";
}

function addMessage(msg) {
  const div = document.createElement("div");
  div.textContent = msg;
  document.getElementById("messages").appendChild(div);
}
