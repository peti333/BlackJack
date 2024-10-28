const socket = io('http://localhost:3000')
const loginButton = document.getElementById('loginButton')
const registerButton = document.getElementById('registerButton')
const loginForm = document.getElementById('login')
const username = document.getElementById('usernameInput')
const password = document.getElementById('passwordInput')
const userlabel = document.getElementById('userLabel')
const passwordlabel = document.getElementById('passwordLabel')
const communication = document.getElementById('communication')
const hitButton = document.getElementById('hit')
const standButton = document.getElementById('stand')
const splitButton = document.getElementById('split')
const doubleDownButton = document.getElementById('doubleDown')
const table = document.getElementById('table')
const navbar = document.getElementById('navbar')
const title = document.getElementById('title')
const leaderboard = document.getElementById('leaderboard')
const rules = document.getElementById('rules')
const betFive = document.getElementById('betFive')
const betTwenty = document.getElementById('betTwenty')
const betFifty = document.getElementById('betFifty')
const betHundred = document.getElementById('betHundred')
let betCircle = document.getElementById('bet')
const timer = document.getElementById('timer')
const bets = document.getElementById('bets')
const actions = document.getElementById('actions')
const dealer = document.getElementById('dealer')
let profile = document.getElementById('profile')
let playerHand = document.getElementById('playerHand')
let dealerHand = document.getElementById('dealerHand')
const popUp = document.getElementById('popUp')
const balance = document.getElementById('balance')


let betValue = 0
let betAddValue = 0
let dealed = 0
let currentPlayerUsername = ''
let lastCurrentPlayer
let otherPlayer
let playerCount = 1
let playerIndex = 1
let roomCode = 0
// -------------
// INCOMING DATA
// -------------


//
//  First 2 cards for every player
//
socket.on('giveCards',data =>{
    console.log(data)
    if(data[0] != roomCode){}
    else{
    let getCards = data[1]['_cards'][0]
    let getUsername = data[1]['_username']
    if(getUsername === username.value){
        playerHand = document.getElementById('playerHand')
        playerHand.innerHTML += '<div class="card">' +  getCards[0]['suit'] + ':' + getCards[0]['value'] +  '</div>'
        playerHand.innerHTML += '<div class="card">' +  getCards[1]['suit'] + ':' + getCards[1]['value'] +  '</div>'
    }
    else{
        table.innerHTML += '<div id=' + getUsername + ' class="player' +playerIndex++ +'" >' + '<div id="profile-' + getUsername +'" class="profileBorder"><p>' + getUsername +'</p>'  + ' </div>  <div id="hand-'+ getUsername +'" class="hand"> <div class="card">' + getCards[0]['suit'] + ':' + getCards[0]['value'] + '</div>' + '<div class="card">' + getCards[1]['suit'] + ':' + getCards[1]['value'] + '</div>' + ' </div>'
    }
    }
    
})

//
//  Recieve one card to player
//
socket.on('giveCard',data =>{
    //console.log(data)
    let getCards = data['_cards']
    let getUsername = data['_username']

    console.log(data)

    if(getUsername === username.value){
        if(data['_splitIndex'] == 0){
            playerHand = document.getElementById('playerHand')
            playerHand.innerHTML += '<div class="card">' + getCards[0][getCards[0].length - 1]['suit'] + ':' + getCards[0][getCards[0].length - 1]['value'] + '</div>'
        }
        else{
            playerHandSplit = document.getElementById('playerHandSplit')
            playerHandSplit.innerHTML += '<div class="card">' + getCards[1][getCards[1].length - 1]['suit'] + ':' + getCards[1][getCards[1].length - 1]['value'] + '</div>'
        }
    }
    else{
        let toPlayer = document.getElementById('profile-'+getUsername)
        let toHand = document.getElementById( 'hand-'+ getUsername)
        toHand.innerHTML += '<div class="card">' + getCards[getCards.length - 1]['suit'] + ':' + getCards[getCards.length - 1]['value'] + '</div>'
    }
})


//
//  Timer information: countdown
//
socket.on('timer', data=> {
    //console.log("timer: " + data)
    timer.innerHTML = "<p>" + data +"</p>"
})



//
//  When countdown hits 0 the game starts
//
socket.on('bettingOver', data => {
    betAddValue = 0
    betFive.hidden = true
    betTwenty.hidden = true
    betFifty.hidden = true
    betHundred.hidden = true
    timer.hidden = true
    dealer.hidden = false
    socket.emit("getCards",username.value)
})


//
//  Dealer first 2 cards
//
socket.on('giveDealer',data => {
    dealerHand = document.getElementById('dealerHand')
    console.log("dealerHand: " + dealerHand)
    if(dealed == 0){
        dealerHand.innerHTML += '<div class="card">' + data[0]['suit'] + ':' + data[0]['value'] + '</div>'
        dealerHand.innerHTML += '<div class="card">' + data[1]['suit'] + ':' + data[1]['value'] + '</div>'
        dealed = 1
    }
    
})


//
//  Dealer drawing cards according to rules
//
socket.on('giveDealerMore',data => {
    
    dealerHand = document.getElementById('dealerHand')
    let getCards = data['_cards'][0]

    for(let i = 2; i < getCards.length; i++){
        dealerHand.innerHTML += '<div class="card">' + getCards[i]['suit'] + ':' + getCards[i]['value'] + '</div>'
    }

    timer.hidden = false
    
})

socket.on('playerTurn',data => {

    profile = document.getElementById('profile')
    otherPlayer = document.getElementById('profile-' + data)
    lastCurrentPlayer = document.getElementById('profile-' + currentPlayerUsername)
    if(data == username.value){
        profile.classList.add("activeProfile")
        actions.hidden = false
    }
    else{
        actions.hidden = true
        if(otherPlayer){
            otherPlayer.style.border = "2px solid #1e0930"
        }
        profile.classList.remove("activeProfile")
    }
    if(currentPlayerUsername !== "" && data !== currentPlayerUsername && lastCurrentPlayer !== null){
        lastCurrentPlayer.style.border = ""
        lastCurrentPlayer.classList.remove("activeProfile")
    }
    currentPlayerUsername = data
})

socket.on('playerCount',data => {
    playerCount = data
})

socket.on('playerLose', data => {
    popUp.innerText = "You lose"
    popUp.hidden = false
    actions.hidden = true
})

socket.on('betACK', data => {
    console.log(data)
    if(data != 0){   
    betValue += betAddValue
    betCircle.innerHTML = "<p>" + betValue + "$</p>"
    }
})

socket.on('doubleACK', data => {
    betValue *= 2
    betCircle.innerHTML = "<p>" + betValue + "$</p>"
})

socket.on('canSplit', data => {
    if(data == username.value){
        splitButton.hidden = false
    }
})

socket.on('balanceUPDT', data => {
    balance.innerHTML = data + '$' 
})

socket.on('split', data => {
    document.getElementById('playerHandSplit').hidden = false
    splitButton.hidden = true
    doubleDownButton.hidden = true

    console.log(data)

    let firstCards = data['_cards'][0]
    let secondCards = data['_cards'][1]
    let getUsername = data['_username']
    
    if(getUsername === username.value){
        playerHand = document.getElementById('playerHand')
        playerHand.innerHTML = '<div class="card">' + firstCards[0]['suit'] + ':' + firstCards[0]['value'] + '</div>'

        playerHandSplit = document.getElementById('playerHandSplit')
        playerHandSplit.innerHTML = '<div class="card">' + secondCards[0]['suit'] + ':' + secondCards[0]['value'] + '</div>'
    }
    else{
        let toPlayer = document.getElementById('profile-'+getUsername)
        let toHand = document.getElementById( 'hand-'+ getUsername)
        toHand.innerHTML += '<div class="card">' + getCards[getCards.length - 1]['suit'] + ':' + getCards[getCards.length - 1]['value'] + '</div>'
    }
})

socket.on('requestNewGame',data => {
    playerIndex = 1
    console.log("GAMEOVER")
    playerHand = document.getElementById('playerHand')
    playerHand.innerHTML = ""
    playerHandSplit.innerHTML = ""
    dealerHand.innerHTML = ""
    while(table.children.length > 2){
        table.children[table.children.length - 1].remove()
    }
    dealed = 0
    betAddValue = 0
    betValue = 0
    betCircle = document.getElementById('bet')
    betCircle.innerHTML = '<p> 0$ </p>'
    
    /*betCircle.addEventListener('click', e => {
        socket.emit('addBet', username.value + ":" + betAddValue)
    })
    */
    betFive.hidden = false
    betTwenty.hidden = false
    betFifty.hidden = false
    betHundred.hidden = false
    actions.hidden = true
    dealer.hidden = true  
    timer.hidden = false
    popUp.hidden = true

    socket.emit('newGame',username.value)
})

socket.on('gameOver', data => {
    console.log(data)
    for(let i = 0; i < data.length; i++){
        if(data[i][0] == username.value){
            switch(data[i][1][0]){
                case -1:
                    popUp.innerText = "You lose"
                    break
                case 0:
                    popUp.innerText = "You tie"
                    break
                case 1:
                    popUp.innerText = "You win"
                    break
            }
            switch(data[i][1][1]){
                case -1:
                    popUp.innerText += " the first hand, and you lose the second"
                    break
                case 0:
                    popUp.innerText += " the first hand, and you tie the second"
                    break
                case 1:
                    popUp.innerText += " the first hand, and you win the second"
                    break
            }
            popUp.hidden = false
        }
    }
    
    socket.emit('postGame',username.value)
})

socket.on('registerACK', data => {
    if(data == 1){
        console.log('Register successfull')
    }
    else{
        console.log('Register failed')
    }
})

/*
socket.on('loginACK', data => {
    console.log("ASD")
    if(data == 1){
        console.log('Login successfull')
        profile.innerHTML = '<p>' + username.value + '</p>'
        bets.hidden = false
        loginButton.hidden = true
        registerButton.hidden = true
        username.hidden = true
        password.hidden = true
        userlabel.hidden = true
        passwordlabel.hidden = true
        title.hidden = true
        table.hidden = false
        //navbar.hidden = false
        navbar.style.visibility = 'visible'
        timer.hidden = false
        socket.emit('loginSubmit',username.value)
    }
    else if(data == 2){
        console.log('admin login')
        window.location.href = '/admin'
    }
    else{
        console.log('Login failed')
    }
})
*/

socket.on('loginACK', (result) => {
    if (result === 1) {
        console.log("Login successful");
        loginButton.hidden = true
        registerButton.hidden = true
        username.hidden = true
        password.hidden = true
        userlabel.hidden = true
        passwordlabel.hidden = true
        document.getElementById('availableRooms').hidden = false;  // Show available rooms
        document.getElementById('joinRoomSection').hidden = false;  // Show join room section
        socket.emit('getActiveRooms');  // Request active rooms
    } else {
        console.error("Login failed");
    }
});

socket.on('activeRoomsList', (rooms) => {
    const roomsList = document.getElementById('roomsList');
    roomsList.innerHTML = '';  // Clear previous rooms
    rooms.forEach(room => {
        const li = document.createElement('li');
        li.textContent = room;  // Display room ID
        roomsList.appendChild(li);
    });
});

document.getElementById('refreshRoomsButton').addEventListener('click', () => {
    socket.emit('getActiveRooms');
});

document.getElementById('joinRoomButton').addEventListener('click', () => {
    const roomId = document.getElementById('roomIdInput').value;
    const username = document.getElementById('usernameInput').value;  // Get username
    socket.emit('joinRoom', [username, roomId]);
});

document.getElementById('createRoomButton').addEventListener('click', e => {
    document.getElementById('availableRooms').hidden = true
    document.getElementById('joinRoomSection').hidden = true
    document.getElementById('createRoomSection').hidden = false
    roomCode = Math.floor(1 + Math.random() * 999999)
    socket.emit('tryCreateRoom', roomCode)
})

socket.on('getActiveRoomsACK', data => {
    document.getElementById('roomsList').innerHTML = '';
    for (let i = 0; i < data.length; i++) {
        const listItem = document.createElement('li');
        listItem.innerHTML = data[i] + ' <input type="button" id="button' + i + '" value="Join Room">';
        document.getElementById('roomsList').appendChild(listItem);

        const button = listItem.querySelector('input[type="button"]');
        button.addEventListener('click', function() {
            socket.emit('joinRoom', [username.value, data[i]])
        })
    }
})

socket.on('joinedRoom', data => {
    document.getElementById('createRoomSection').hidden = true
    document.getElementById('roomCode').innerText = roomCode
    profile.innerHTML = '<p>' + username.value + '</p>'
    bets.hidden = false
    title.hidden = true
    table.hidden = false
    navbar.style.visibility = 'visible'
    timer.hidden = false
    socket.emit('loginSubmit',username.value)
})

socket.on('tryCreateRoomACK', data => {
    console.log("ASD")
    if(data[0] == 1){
        document.getElementById('roomCode').innerText = data[1]
    }
    else{
        roomCode = Math.floor(1 + Math.random() * 999999)
        socket.emit('tryCreateRoom', roomCode)
    }
})


let changeRoomTypeButton = document.getElementById('changeRoomType')
changeRoomTypeButton.addEventListener('click', e => {
    changeRoomTypeButton.value = changeRoomTypeButton.value == 'Public' ? 'Private' : 'Public'
})

document.getElementById('startCreatedGame').addEventListener('click', e => {
    socket.emit('createRoom',roomCode)
    socket.emit('joinRoom', [username.value,roomCode])
})

socket.on('roomCreated', data => {
    document.getElementById('roomCode').innerText = data
})

socket.on('redirectToAdmin', data => {
    window.location.href = data
})

socket.on('canDouble', data => {
    if(data == username.value){
        doubleDownButton.hidden = false
    }
})

//  -------
//  BUTTONS
//  -------

// LOGIN BUTTON
loginButton.addEventListener('click', e => {
    //console.log(username.value + " " + password.value)
    const data = [username.value,password.value]
    socket.emit('clientLogin',data)
    
})

// REGISTER BUTTON
registerButton.addEventListener('click', e => {
    const data = [username.value,password.value]


    socket.emit('clientRegister',data)
})


//ACTION BUTTONS
hitButton.addEventListener('click', e => {
    const data = username.value + ":hit"
    socket.emit('action',data)
})

standButton.addEventListener('click', e => {
    const data = username.value + ":stand"
    socket.emit('action',data)
})

splitButton.addEventListener('click', e => {
    const data = username.value + ":split"
    socket.emit('action',data)
})

doubleDownButton.addEventListener('click', e => {
    const data = username.value + ":double"
    socket.emit('action',data)
})



// BET BUTTONS
betFive.addEventListener('click', e => {
    betAddValue = 5
})

betTwenty.addEventListener('click', e => {
    betAddValue = 20
})

betFifty.addEventListener('click', e => {
    betAddValue = 50
})

betHundred.addEventListener('click', e => {
    betAddValue = 100
})

betCircle.addEventListener('click', e => {
    socket.emit('addBet', [username.value,betAddValue])
})

window.addEventListener('beforeunload', e => {
    socket.emit('playerDisconnect',username.value)
})


function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
  }
  
function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}