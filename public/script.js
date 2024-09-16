const socket = io('http://localhost:3000')
const loginButton = document.getElementById('loginButton')
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
const betCircle = document.getElementById('bet')
const timer = document.getElementById('timer')
const bets = document.getElementById('bets')
const actions = document.getElementById('actions')
let profile = document.getElementById('profile')
let playerHand = document.getElementById('playerHand')
let dealerHand = document.getElementById('dealerHand')

let betValue = 0
let betAddValue = 0
let dealed = 0


// -------------
// INCOMING DATA
// -------------


//
//  First 2 cards for every player
//
socket.on('giveCards',data =>{

    let getCards = data['_cards']
    let getUsername = data['_username']
    if(getUsername === username.value){
        playerHand = document.getElementById('playerHand')
        playerHand.innerHTML += '<div class="card">' +  getCards[0]['suit'] + ':' + getCards[0]['value'] +  '</div>'
        playerHand.innerHTML += '<div class="card">' +  getCards[1]['suit'] + ':' + getCards[1]['value'] +  '</div>'
    }
    else{
        //TODO: class:playerX for multiple players
        table.innerHTML += '<div id=' + getUsername + '>' + '<div class="card">' + getCards[0]['suit'] + ':' + getCards[0]['value'] + '</div>' + '<div class="card">' + getCards[1]['suit'] + ':' + getCards[1]['value'] + '</div>' + '</div'
    }
    
})

//
//  Recieve one card to player
//
socket.on('giveCard',data =>{
    //console.log(data)
    let getCards = data['_cards']
    let getUsername = data['_username']

    if(getUsername === username.value){
        playerHand = document.getElementById('playerHand')
        playerHand.innerHTML += '<div class="card">' + getCards[getCards.length - 1]['suit'] + ':' + getCards[getCards.length - 1]['value'] + '</div>'
    }
    else{
        //TODO: class:playerX for multiple players
        let toPlayer = document.getElementById(getUsername)
        toPlayer.innerHTML += '<div class="card">' + getCards[getCards.length - 1]['suit'] + ':' + getCards[getCards.length - 1]['value'] + '</div>'
    }
})


//TODO: REMOVE
socket.on('hitBroadcast', data=> {
    //console.log(data)
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
    actions.hidden = false
    timer.hidden = true
    socket.emit("getCards",username.value)
})


//
//  Dealer first 2 cards
//
socket.on('giveDealer',data => {
    //console.log(data)
    dealerHand = document.getElementById('dealerHand')
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
    let getCards = data['_cards']

    for(let i = 2; i < getCards.length; i++){
        console.log(getCards[i]['suit'] + ":" + getCards[i]['value'])
        dealerHand.innerHTML += '<div class="card">' + getCards[i]['suit'] + ':' + getCards[i]['value'] + '</div>'
    }
    
})

socket.on('playerTurn',data => {
    console.log(data)
    profile = document.getElementById('profile')
    if(data == username.value){
        console.log("MATCH")
        profile.classList.add("activeProfile")
    }
    else{
        profile.classList.remove("activeProfile")
    }
})


//  -------
//  BUTTONS
//  -------

// LOGIN BUTTON
loginButton.addEventListener('click', e => {
    //console.log(username.value + " " + password.value)
    const data = username.value   // + ";password:" + password.value
    socket.emit('loginSubmit',data)


    profile.innerHTML = '<p>' + username.value + '</p>'
    bets.hidden = false
    loginButton.hidden = true
    username.hidden = true
    password.hidden = true
    userlabel.hidden = true
    passwordlabel.hidden = true
    title.hidden = true
    table.hidden = false
    navbar.hidden = false
    timer.hidden = false
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


// NAVBAR BUTTONS
rules.addEventListener('click', e => {
    rules.style.backgroundColor = "purple"
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
    betValue += betAddValue
    betCircle.innerHTML = "<p>" + betValue + "$ </p>"
})
