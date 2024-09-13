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
const playerHand = document.getElementById('playerHand')
const dealerHand = document.getElementById('dealerHand')

let betValue = 0
let betAddValue = 0


socket.on('giveCards',data =>{
    //console.log(data)
    playerHand.innerHTML += '<div class="card">' + data[0]['suit'] + ':' + data[0]['value'] + '</div>'
    playerHand.innerHTML += '<div class="card">' + data[1]['suit'] + ':' + data[1]['value'] + '</div>'
})

socket.on('giveCard',data =>{
    //console.log(data)
    playerHand.innerHTML += '<div class="card">' + data['suit'] + ':' + data['value'] + '</div>'
})

socket.on('hitBroadcast', data=> {
    //console.log(data)
})

socket.on('timer', data=> {
    //console.log("timer: " + data)
    timer.innerHTML = "<p>" + data +"</p>"
})

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

socket.on('giveDealer',data => {
    //console.log(data)
    dealerHand.innerHTML += '<div class="card">' + data[0]['suit'] + ':' + data[0]['value'] + '</div>'
    dealerHand.innerHTML += '<div class="card">' + data[1]['suit'] + ':' + data[1]['value'] + '</div>'
})

// LOGIN BUTTON


loginButton.addEventListener('click', e => {
    //console.log(username.value + " " + password.value)
    const data = "username:" + username.value + ";password:" + password.value
    socket.emit('loginSubmit',data)

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
    const data = "hit"
    socket.emit('action',data)
})

standButton.addEventListener('click', e => {
    const data = "stand"
    socket.emit('action',data)
})

splitButton.addEventListener('click', e => {
    const data = "split"
    socket.emit('action',data)
})

doubleDownButton.addEventListener('click', e => {
    const data = "double"
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
