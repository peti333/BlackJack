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

io.on('connection', (socket) => {
  socket.on('sendData', data =>{
    console.log(data)
    socket.broadcast.emit('getData',data)
  })
  socket.on('loginSubmit', data =>{
    console.log("user logged in: " + data)
    //TODO: don't allow to join mid game
    //TODO: check if player can bet
    operator.addPlayer(data)
    if(!timerStarted){
      let timer = 15
      timerStarted = true
    setInterval(function() {
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
        }
        gameStarted = true
        //timer = 10
      }
    }, 1000)
    }
  })

  //DATA => username
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
        io.emit('giveDealerMore',operator.getDealer())
        operator.getGameOverPlayers()
        }
        currentPlayer = operator.getCurrentPlayerUsername()
        io.emit('playerTurn',currentPlayer)
        break
      case "split":
        break
      case "double":
        break
    }
    //operator.writeAllCards()
  })
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});