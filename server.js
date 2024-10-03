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



//const Player = require("./player");


let timerStarted = false
let gameStarted = false
let timer = 10


//SOCKET EVENTS

io.on('connection', (socket) => {
  socket.on('sendData', data =>{
    console.log(data)
    socket.broadcast.emit('getData',data)
  })

  //STARTING SCREEN
  socket.on('loginSubmit', data =>{
    console.log("user logged in: " + data)
    if(!gameStarted){
      operator.addPlayer(data,handler.getUserBalance(data))
      console.log(handler.getUserBalance(data))
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


  socket.on('clientRegister',data => {
    console.log('Register attempt: ' + data)
    if(!handler.checkIfUserExists(data[0])){
      handler.createUser(data[0],data[1])
      socket.emit('registerACK',1)
    }
    else{
      socket.emit('registerACK',0)
    }
  })

  socket.on('clientLogin',data => {
    console.log('Login attempt: ' + data)
    if(handler.checkIfUserExists(data[0])){
      if(handler.checkPassword(data[0],data[1])){
        socket.emit('loginACK',1)
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
    io.emit('giveDealer',operator.getDealer()._cards)
    let currentPlayer = operator.getCurrentPlayerUsername()
    io.emit('playerTurn',currentPlayer)
  })

  socket.on('action', data =>{
    console.log("user action: " + data)
    let datas = data.split(":")
    let username = datas[0]
    let action = datas[1]
    let currentPlayer = ""
    switch(action){
      case "hit":
        let canHit = operator.playerHit(username)
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
      //TODO: IMPLEMENT THESE
      case "split":
        break
      case "double":
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
    console.log(data + " has disconnected")
  })
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});