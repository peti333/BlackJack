const socket = io('http://localhost:3000')

usernameInput = document.getElementById('usernameInput')
passwordInput = document.getElementById('passwordInput')
loginButton = document.getElementById('loginButton')
createRoomButton = document.getElementById('createRoomButton')
joinRoomButton = document.getElementById('joinRoomButton')


loginButton.addEventListener('click', e => {
    let data = [usernameInput.value, passwordInput.value]
    socket.emit('clientLogin', data)
})

socket.on('loginACK', data => {
    if(data == 1){
        document.getElementById('login').hidden = true
        document.getElementById('loginButton').hidden = true
        document.getElementById('registerButton').hidden = true
        document.getElementById('usernameInput').hidden = true
        document.getElementById('passwordInput').hidden = true
        document.getElementById('userLabel').hidden = true
        document.getElementById('passwordLabel').hidden = true
        document.getElementById('createRoom').hidden = false
        document.getElementById('joinRoom').hidden = false
    }
})

createRoomButton.addEventListener('click', e => {
    createRoomButton.hidden = true
    joinRoomButton.hidden = true
    document.getElementById('createRoom').hidden = true
    document.getElementById('joinRoom').hidden = true
    document.getElementById('createLobby').hidden = false
    socket.emit('getNewRoomCode',usernameInput.value)
})

joinRoomButton.addEventListener('click', e => {
    createRoomButton.hidden = true
    joinRoomButton.hidden = true
    document.getElementById('createRoom').hidden = true
    document.getElementById('joinRoom').hidden = true
})

function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
  }
  
function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}