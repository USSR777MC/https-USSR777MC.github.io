let localConnection;
let dataChannel;
let roomCode = "";

// Random 6-char join code
function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Generate color per username
function getColor(name) {
  const colors = ["#FF5555","#55FF55","#55FFFF","#FF55FF","#FFFF55"];
  let hash = 0;
  for(let i=0;i<name.length;i++) hash += name.charCodeAt(i);
  return colors[hash % colors.length];
}

// Add message to chat
function addMessage(msg, name="") {
  const div = document.createElement("div");
  div.textContent = msg;

  if(name && !msg.startsWith("Me:")) {
    div.style.backgroundColor = getColor(name);
  }

  if(msg.startsWith("Me:")) div.classList.add("me");

  const messages = document.getElementById("messages");
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

// Host button
document.getElementById("hostBtn").onclick = () => {
  const username = document.getElementById("username").value || "Host";

  roomCode = generateCode();
  document.getElementById("roomCode").textContent = roomCode;
  document.getElementById("room").style.display = "block";

  localConnection = new RTCPeerConnection();
  dataChannel = localConnection.createDataChannel("chat");
  dataChannel.onmessage = (e) => addMessage(e.data);

  localConnection.onicecandidate = (event) => {
    if(event.candidate) return; // handled internally for simplicity
  };

  localConnection.ondatachannel = (event) => {
    const receiveChannel = event.channel;
    receiveChannel.onmessage = (e) => addMessage(e.data);
  };

  console.log(`Share this code with friends: ${roomCode}`);
};

// Join button
document.getElementById("joinBtn").onclick = () => {
  const username = document.getElementById("username").value || "Guest";
  const inputCode = prompt("Enter room code:");

  if(!inputCode) return alert("No code entered!");

  roomCode = inputCode.toUpperCase();
  document.getElementById("roomCode").textContent = roomCode;
  document.getElementById("room").style.display = "block";

  localConnection = new RTCPeerConnection();
  localConnection.ondatachannel = (event) => {
    dataChannel = event.channel;
    dataChannel.onmessage = (e) => addMessage(e.data);
  };
};

// Send message
function sendMsg() {
  const msgInput = document.getElementById("msg");
  const msg = msgInput.value;
  if(msg && dataChannel) {
    dataChannel.send(msg);
    addMessage("Me: " + msg);
  }
  msgInput.value = "";
}
