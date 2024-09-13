/*
TODO:
  - server side betting
  - dealer
  - player
    - card
    - bet
    - balance
  - other players
    - hand
    - bet
  - buttons appearing in situations: double, split
  - playing the game
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
    operator.addPlayer(data)
    if(!timerStarted){
      let timer = 5
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
        }
        gameStarted = true
        //timer = 10
      }
    }, 1000)
    }
  })
  //DATA => username
  //TODO: change getPlayer to currentPlayer
  socket.on('getCards',data =>{
    let cards = operator.getPlayer(0).getCards()
    io.emit('giveCards',cards)
    io.emit('giveDealer',operator.getDealer()._cards)
  })

  socket.on('action', data =>{
    console.log("user action: " + data)

    switch(data){
      case "hit":
        operator.playerHit()
        let card = operator.getPlayer(0).getLastCard()
        io.emit('giveCard',card)
        break
      case "stand":
        operator.playerStand()
        //TODO:remove after testing
        break
      case "split":
        break
      case "double":
        break
    }
    //operator.writeAllCards()
    socket.broadcast.emit('hitBroadcast',data)
  })
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

function timerDone(){

}