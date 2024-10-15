/*
  - buttons appearing in situations: double, split
  - dataBase
  - leaderboard
  - signing in
  - profile stats
  - rules
  - assets
    - cards
    - table
    - profile pictures
  - admin page
*/
// GAME
const gameOperator = require("./gameOperator.js")
const operator = new gameOperator()

// CONNECTION
const express = require('express')
const http = require('http')
const socketIo = require('socket.io')
const app = express()
const server = http.createServer(app)
const io = socketIo(server)
app.use(express.static('public'))



//DATABASE
const mysql = require('mysql2')
const databaseHandler = require("./databaseHandler.js")
const handler = new databaseHandler()


let timerStarted = false
let gameStarted = false
let timer = 10


app.get('/admin', (req, res) => {
  //if (req.session.username === 'admin') {
    res.sendFile(__dirname + '/public/admin.html'); // Serve admin page
  //} else {
   //res.status(403).send('Forbidden'); // Return forbidden status if not admin
  //}
});


//SOCKET EVENTS

io.on('connection', (socket) => {
  socket.on('sendData', data =>{
    console.log(data)
    socket.broadcast.emit('getData',data)
  })

  //STARTING SCREEN
  socket.on('loginSubmit', async data =>{
    console.log("user logged in: " + data)
    if(!gameStarted){
      let balance = await handler.getUserBalance(data)
      operator.addExistingPlayer(data,balance)
      socket.emit('balanceUPDT',balance)
      if(!timerStarted){
        timer = 10
        timerStarted = true
      let firstCountDown = setInterval(function() {
        if(timer > 0){
          console.log(timer)
          io.emit('timer',timer)
        }
        if(--timer < 0){
          if(!gameStarted){
            io.emit('bettingOver',0)
            operator.startGame()
            let playerCount = operator.getPlayerCount()
            io.emit('playerCount',playerCount)
            clearInterval(firstCountDown)
          }
          gameStarted = true
      }
    }, 1000)
    }
    }
  })


  socket.on('clientRegister', async data => {
    console.log('Register attempt: ' + data)
    let exists = await handler.checkIfUserExists(data[0])
    console.log(exists)
    if(!exists){
      handler.createUser(data[0],data[1])
      socket.emit('registerACK',1)
    }
    else{
      socket.emit('registerACK',0)
    }
  })

  socket.on('clientLogin',async data => {
    console.log('Login attempt: ' + data)
    let exists = await handler.checkIfUserExists(data[0])
    if(exists){
      if(handler.checkPassword(data[0],data[1]) && data[1] != ""){
        if(data[0] == 'admin'){
          socket.emit('redirectToAdmin', '/admin')
        }
        else{
          socket.emit('loginACK',1)
          socket.emit('currentPlayerTableACK', /* ??? */)
        }
      }
      else{
        socket.emit('loginACK',0)
      }
    }
    else{
      socket.emit('loginACK',0)
    }
  })
  

  //GAME SCREEN
  socket.on('getCards',data =>{
    console.log(data)
    let cards = operator.getPlayer(data)
    console.log(cards)
    io.emit('giveCards',cards)
    io.emit('giveDealer',operator.getDealer()._cards[0])
    let currentPlayer = operator.getCurrentPlayerUsername()
    io.emit('playerTurn',currentPlayer)
    if(operator.getPlayer(currentPlayer).getBalance() >= operator.getPlayer(currentPlayer).getBet()){
      io.emit('canDouble', currentPlayer)
    }
    if(operator.getPlayer(currentPlayer)['_canSplit']){
      io.emit('canSplit', currentPlayer)
    }
  })

  socket.on('action', data =>{
    console.log("user action: " + data)
    let datas = data.split(":")
    let username = datas[0]
    let action = datas[1]
    let currentPlayer = ""
    switch(action){
      case "split":
        operator.playerSplit(username)
        let playerCards = operator.getPlayer(username)
        socket.emit('split',playerCards)
        break
      case "double":
        socket.emit('doubleACK', 1)
        operator.playerDouble(username)
        let cards = operator.getPlayer(username)
        socket.emit('balanceUPDT',operator.getPlayer(username).getBalance())
        io.emit('giveCard',cards)
        if(operator['_roundOver']){
          console.log("ROUNDOVER")
          io.emit('giveDealerMore',operator.getDealer())
          let gameOverState = operator.getGameOverPlayers()
          operator.gameOver()
          handler.updateUserGameInfo(gameOverState)
        gameStarted = false
        timerStarted = false
        io.emit('gameOver',gameOverState)
        break
        }
        currentPlayer = operator.getCurrentPlayerUsername()
        io.emit('playerTurn',currentPlayer)
      case "hit":
        let canHit = operator.playerHit(username)
        console.log("canHit: " + canHit)
        if(canHit[0]){
          let cards = operator.getPlayer(username)
          io.emit('giveCard',cards)
          if(canHit[1]){
            socket.emit('playerLose',0)
            action = "stand"
          }
          else{
            break
          }
        }
        else{
          break
        }
      case "stand":
        console.log("stand")
        operator.playerStand(username)
        if(operator['_roundOver']){
          console.log("ROUNDOVER")
          io.emit('giveDealerMore',operator.getDealer())
          let gameOverState = operator.getGameOverPlayers()
          operator.gameOver()
          handler.updateUserGameInfo(gameOverState)
        gameStarted = false
        timerStarted = false
        io.emit('gameOver',gameOverState)
        break
        }
        currentPlayer = operator.getCurrentPlayerUsername()
        io.emit('playerTurn',currentPlayer)
        break
    }
  })

  socket.on('postGame', data=>{
    if(!timerStarted){
      timerStarted = true
      timer = 5
      let wait = setInterval(function() {
        io.emit('timer',timer)
        if(--timer < 0){
          timerStarted = false
          timer = 10
          gameStarted = false
          io.emit('requestNewGame',1)
          clearInterval(wait)
        }
      },1000)
    }
  })


  socket.on('newGame',data => {
    operator.clearPlayerHands()
    socket.emit('balanceUPDT',operator.getPlayer(data).getBalance())
    if(!gameStarted){
      if(!timerStarted){
        timer = 10
        timerStarted = true
      let countdown = setInterval(function() {
        if(timer > 0){
          console.log(timer)
          io.emit('timer',timer)
        }
        if(--timer < 0){
          if(!gameStarted){
            console.log("NEW ROUND STARTING")
            io.emit('bettingOver',0)
            operator.startGame()
            let playerCount = operator.getPlayerCount()
            io.emit('playerCount',playerCount)
            gameStarted = true
            clearInterval(countdown)
          }         
      }
    }, 1000)
    }
    }
  })

  socket.on('addBet', data => {
    let datas = data.split(':')
    let value = datas[1]
    let username = datas[0]

    socket.emit('betACK',operator.getPlayer(username).addBet(value))
    socket.emit('balanceUPDT',operator.getPlayer(username).getBalance())
  })
  
  socket.on('playerDisconnect', data => {
    operator.removePlayer(data)
    socket.emit('currentPlayerTableACK', /* ??? */)
    console.log(data + " has disconnected")
  })


  socket.on('getAllUsernames', async data => {
    let outData = await handler.getAllUsernames()
    socket.emit('getAllUsernamesACK',outData)
  })

  socket.on('getUserInformation', async data => {
    let outData = await handler.getUserInformation(data)
    socket.emit('getUserInformationACK',outData)
  })

  socket.on('deleteUser', async data => {
    let result = await handler.deleteUser(data)
    socket.emit('deleteUserACK',result)
  })

  socket.on('getUserSignupDates', async data => {
    let result = await handler.getUserSignUpMonths()
    socket.emit('getUserSignupDatesACK',result)
  })

  socket.on('getUserBalanceCharts', async data => {
    let result = await handler.getUserBalances()
    socket.emit('getUserBalanceChartsACK', result)
  })

  socket.on('getWinRate', async data => {
    let result = await handler.getWinRate()
    socket.emit('getWinRateACK',result)
  })

  socket.on('getUserActivity', async data => {
    let result = await handler.getUserActivity(data)
    socket.emit('getUserActivityACK',result)
  })

});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});