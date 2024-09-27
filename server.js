/*
TODO:
  - server side betting
  - player
    - bet
    - balance
  - other players
    - bet
  - buttons appearing in situations: double, split
LATER:
  - dataBase
  - leaderboard
  - signing in
  - profile stats
  - rules
  - assets
    - cards
    - table
    - profile pictures
*/
// GAME
const gameOperator = require("./gameOperator.js")
const operator = new gameOperator();

// CONNECTION
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const Player = require("./player");

const app = express();

const server = http.createServer(app);

const io = socketIo(server);

app.use(express.static('public'));

let timerStarted = false
let gameStarted = false
let timer = 15

io.on('connection', (socket) => {
  socket.on('sendData', data =>{
    console.log(data)
    socket.broadcast.emit('getData',data)
  })
  socket.on('loginSubmit', data =>{
    console.log("user logged in: " + data)
    if(!gameStarted){
      operator.addPlayer(data)
      if(!timerStarted){
        timer = 15
        timerStarted = true
      let firstCountDown = setInterval(function() {
        if(timer > 0){
          console.log(timer)
          io.emit('timer',timer)
        }
        //TODO: stop
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
          if(!canHit[1]){
            break
          }
          
        }
        action = "stand"
      case "stand":
        operator.playerStand(username)
        if(operator['_roundOver']){
          console.log("ROUNDOVER")
          io.emit('giveDealerMore',operator.getDealer())
          let gameOverState = operator.getGameOverPlayers()
          operator.gameOver()
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

  socket.on('newGame',data => {
    console.log("newGame")
    operator.clearPlayerHands()
    if(!gameStarted){
      //TODO: new player
      //operator.addPlayer(data)
      if(!timerStarted){
        timer = 15
        timerStarted = true
      let countdown = setInterval(function() {
        if(timer > 0){
          console.log(timer)
          io.emit('timer',timer)
        }
        //TODO: stop
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
  //TODO: check if player can bet
    let datas = data.split(':')
    let value = datas[1]
    //Returns the bet value or 0
    io.emit('betACK',data)
  })
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});