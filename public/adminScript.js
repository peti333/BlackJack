const socket = io('http://localhost:3000')
const optionsSelect = document.getElementById('optionsSelect')
const playerInfoButton = document.getElementById('playerInfoButton')
const playerInfoTable = document.getElementById('playerInfoTable')
const RegisterButton = document.getElementById('RegisterButton')
const usernameInput = document.getElementById('usernameInput')
const passwordInput = document.getElementById('passwordInput')

//SOCKET EVENTS

socket.emit('getAllUsernames','admin')

socket.on('getAllUsernamesACK', data => {
    optionsSelect.innerHTML = ""
    for(let i = 0; i < data.length; i++){
        optionsSelect.innerHTML += '<option value="' + data[i]['username'] +'">' + data[i]['username'] + '</option>'
    }
})

socket.on('getUserInformationACK',data => {
    playerInfoTable.hidden = false
    playerInfoTable.innerHTML += '<tbody id="' + data[0]['username'] + '"><tr><td>' + data[0]['id'] +'</td><td>' + data[0]['id'] + '</td><td>' + data[0]['balance'] + '</td><td>' + data[0]['wins'] + '</td><td>' + data[0]['ties'] + '</td><td>' + data[0]['losses'] + '</td><td>' + data[0]['joined'] + '</td><td><input id="buttonHide' + data[0]['id'] + '"type="button" value="X"></td><td><input id="buttonDelete' + data[0]['id'] + '"type="button" value="Delete"></td></tr></tbody>'
    document.getElementById('buttonHide' + data[0]['id']).addEventListener('click', e => {
        document.getElementById(data[0]['username']).hidden = true
    })
    document.getElementById('buttonDelete' + data[0]['id']).addEventListener('click', e => {
        socket.emit('deleteUser',data[0]['username'])
    })
})

socket.on('deleteUserACK', data => {
    if(data){
        document.getElementById(data).hidden = true
    }
})

socket.on('registerACK', data => {
    socket.emit('getAllUsernames','admin')
})


// EVENT LISTENERS

playerInfoButton.addEventListener('click', e => {
    socket.emit('getUserInformation', optionsSelect.value)
})

RegisterButton.addEventListener('click', e=> {
    let data = [usernameInput.value,passwordInput.value]
    socket.emit('clientRegister', data)
})