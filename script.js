let localConnection;
let dataChannel;
let roomCode = "";

// Generate a short random code
function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

document.getElementById("hostBtn").onclick = () => {
  const username = document.getElementById("username").value || "Host";

  roomCode = generateCode();
  document.getElementById("roomCode").textContent = roomCode;
  document.getElementById("room").style.display = "block";

  // create peer connection and channel
  localConnection = new RTCPeerConnection();
  dataChannel = localConnection.createDataChannel("chat");
  dataChannel.onmessage = (e) => addMessage(e.data);

  // host-side ICE candidate handler
  localConnection.onicecandidate = (event) => {
    if (event.candidate) return; // ignore for now
  };

  // receive channel for guests
  localConnection.ondatachannel = (event) => {
    const receiveChannel = event.channel;
    receiveChannel.onmessage = (e) => addMessage(e.data);
  };

  console.log(`Share this code with friends: ${roomCode}`);
};

document.getElementById("joinBtn").onclick = () => {
  const username = document.getElementById("username").value || "Guest";
  const inputCode = prompt("Enter room code:");

  if (!inputCode) return alert("No code entered!");

  roomCode = inputCode.toUpperCase();
  document.getElementById("roomCode").textContent = roomCode;
  document.getElementById("room").style.display = "block";

  // create peer connection
  localConnection = new RTCPeerConnection();

  localConnection.ondatachannel = (event) => {
    dataChannel = event.channel;
    dataChannel.onmessage = (e) => addMessage(e.data);
  };
};

function sendMsg() {
  const msgInput = document.getElementById("msg");
  const msg = msgInput.value;
  if (msg && dataChannel) {
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
