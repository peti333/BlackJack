/*
TODO:
  -lelassítás
  -admin befejez
  - több játék
  - bug fixing
  - FONTOS: Double down nem látszódik kártya
NICE TO HAVE:
  - animáció
  - képek / kártyák
  - privát szóbák
  - kiírni hogy jó/rossz a login/register
(REFACTOR):
  -mysql lehet alapból promise-t ad: https://sidorares.github.io/node-mysql2/docs#first-query
*/
// GAME
const GamesOrganizer = require('./gamesOrganizer.js')
const gameOperator = require("./gameOperator.js")

const organizer = new GamesOrganizer()
//organizer.createNewGame()
//const operator = new gameOperator(1)

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
let timers = []



//SOCKET EVENTS

io.on('connection', (socket) => {
  socket.on('sendData', data =>{
    console.log(data)
    socket.broadcast.emit('getData',data)
  })

  socket.on('createRoom', async (data) => {
    let roomId = organizer.createNewGame(data)
    socket.join(roomId)
    console.log(`Room ${roomId} created.`)
    socket.emit('roomCreated', roomId)
  })
  
  socket.on('tryCreateRoom', async data => {
    if(!organizer.roomExists(data)){
      socket.emit('tryCreateRoomACK',[1,data])
    }
    else{
      socket.emit('tryCreateRoomACK',[0,data])
    }
  })

  socket.on('getActiveRooms', async data => {
    socket.emit('getActiveRoomsACK',organizer.getActiveRooms())
  })

  socket.on('joinRoom', async (data) => {
    let username = data[0];
    let roomId = data[1]
    console.log(username + ' joined room ' + roomId)
    if (organizer.roomExists(roomId)) {
      let balance = await handler.getUserBalance(username);
      organizer.addPlayerToRoom(roomId, username, balance);
      socket.join(roomId);
      socket.emit('joinedRoom', roomId);
      io.to(roomId).emit('playerJoined', { username, balance });
    } else {
      socket.emit('error', 'Room not found');
    }
  })

  socket.on('startGame', (data) => {
    const { roomId } = data;
    if (organizer.roomExists(roomId)) {
      if (!gameTimers[roomId]) {
        let timer = 10;
        gameTimers[roomId] = setInterval(() => {
          if (timer > 0) {
            io.to(roomId).emit('timer', timer);
            timer--;
          } else {
            clearInterval(gameTimers[roomId]);
            organizer.startGameInRoom(roomId);
            io.to(roomId).emit('gameStarted');
          }
        }, 1000);
      }
    } else {
      socket.emit('error', 'Room not found');
    }
  })

  socket.on('action', (data) => {
    const { username, action, roomId } = data;
    if (organizer.roomExists(roomId)) {
      let result = organizer.handlePlayerAction(roomId, username, action);
      io.to(roomId).emit('actionResult', result);
      
      if (result.roundOver) {
        io.to(roomId).emit('roundOver', result.gameState);
        handler.updateUserGameInfo(result.gameState);
        clearInterval(gameTimers[roomId]);
      } else {
        io.to(roomId).emit('playerTurn', result.currentPlayer);
      }
    }
  })

  socket.on('addBet', (data) => {
    const { username, value, roomId } = data;
    if (organizer.roomExists(roomId)) {
      let result = organizer.addBet(roomId, username, value);
      io.to(roomId).emit('betUpdate', { username, balance: result.balance });
    } else {
      socket.emit('error', 'Room not found');
    }
  })
  
  //STARTING SCREEN
  socket.on('loginSubmit', async data =>{
    console.log("user logged in: " + data)
    if(!gameStarted){
      let balance = await handler.getUserBalance(data)
      organizer.addPlayer(data,balance)
      //operator.addExistingPlayer(data,balance)
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
            organizer.findUsernameInGame(data).startGame()
            //operator.startGame()
            let playerCount = organizer.findUsernameInGame(data).getPlayerCount()
            //let playerCount = operator.getPlayerCount()
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
          socket.emit('redirectToAdmin', '/pages/admin.html')
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
    let game = organizer.findUsernameInGame(data)
    let cards = game.getPlayer(data)
    io.emit('giveCards',[game.getId(),cards])
    io.emit('giveDealer',[game.getId(),game.getDealer()._cards[0]])
    let currentPlayer = game.getCurrentPlayerUsername()
    io.emit('playerTurn',[game.getId(), currentPlayer])
    if(game.getPlayer(currentPlayer).getBalance() >= game.getPlayer(currentPlayer).getBet()){
      io.emit('canDouble', [game.getId(),currentPlayer])
    }
    if(game.getPlayer(currentPlayer)['_canSplit']){
      io.emit('canSplit', [game.getId(),currentPlayer])
    }
  })

  socket.on('action', data =>{
    console.log("user action: " + data)
    let game = organizer.findUsernameInGame(username)
    let datas = data.split(":")
    let username = datas[0]
    let action = datas[1]
    let currentPlayer = ""
    switch(action){
      case "split":
        game.playerSplit(username)
        let playerCards = game.getPlayer(username)
        socket.emit('split',playerCards)
        break
      case "double":
        socket.emit('doubleACK', 1)
        game.playerDouble(username)
        let cards = game.getPlayer(username)
        socket.emit('balanceUPDT',game.getPlayer(username).getBalance())
        io.emit('giveCard',cards)
        if(game['_roundOver']){
          console.log("ROUNDOVER")
          io.emit('giveDealerMore',game.getDealer())
          let gameOverState = game.getGameOverPlayers()
          game.gameOver()
          handler.updateUserGameInfo(gameOverState)
        gameStarted = false
        timerStarted = false
        io.emit('gameOver',gameOverState)
        break
        }
        currentPlayer = game.getCurrentPlayerUsername()
        io.emit('playerTurn',currentPlayer)
      case "hit":
        let canHit = game.playerHit(username)
        console.log("canHit: " + canHit)
        if(canHit[0]){
          let cards = game.getPlayer(username)
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
        game.playerStand(username)
        if(game['_roundOver']){
          console.log("ROUNDOVER")
          io.emit('giveDealerMore',game.getDealer())
          let gameOverState = game.getGameOverPlayers()
          game.gameOver()
          handler.updateUserGameInfo(gameOverState)
        gameStarted = false
        timerStarted = false
        io.emit('gameOver',gameOverState)
        break
        }
        currentPlayer = game.getCurrentPlayerUsername()
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
    organizer.findUsernameInGame(data).clearPlayerHands()
    socket.emit('balanceUPDT',organizer.findUsernameInGame(data).getPlayer(data).getBalance())
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
            let playerCount = organizer.findUsernameInGame(data).getPlayerCount()
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
    let value = data[1]
    let username = data[0]
    socket.emit('betACK',organizer.findUsernameInGame(username).getPlayer(username).addBet(value))
    socket.emit('balanceUPDT',organizer.findUsernameInGame(username).getPlayer(username).getBalance())
  })
  
  socket.on('playerDisconnect', data => {
    if(organizer.findUsernameInGame(data) != undefined){
      organizer.findUsernameInGame(data).removePlayer(data)
      socket.emit('currentPlayerTableACK', /* ??? */)
      console.log(data + " has disconnected")
    }
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

  //TODO:
  socket.on('getCurrentUsers', async data => {

  })

  socket.on('getLeaderBoard', async data => {
    let result = await handler.getLeaderBoard()
    socket.emit('getLeaderBoardACK', result)
  })

  socket.on('getNewRoomCode', async data => {
  
  })

});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});