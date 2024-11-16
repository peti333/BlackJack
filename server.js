/*
  - FONTOS: Double down nem látszódik kártya
  Dokumentáció:
  - Bevezetés
  - Felhasznáéói (10 oldal)
  - Fejlesztői (30 oldal)
  -tesztelés
*/
// GAME
const GamesOrganizer = require('./gamesOrganizer.js')
const organizer = new GamesOrganizer()

// CONNECTION
const express = require('express')
const http = require('http')
const socketIo = require('socket.io')
const app = express()
const server = http.createServer(app)
const io = socketIo(server)
app.use(express.static('public'))



//DATABASE
const databaseHandler = require("./databaseHandler.js")
const handler = new databaseHandler()

//SOCKET EVENTS
io.on('connection', (socket) => {
  socket.on('sendData', data =>{
    console.log(data)
    socket.broadcast.emit('getData',data)
  })
  
  //
  // Recieves information about the client attempting to create a room manually
  //
  socket.on('createRoom', async (data) => {
    let roomId = organizer.createNewGame(data[1],data[0])
    organizer.setStatus(roomId,data[2])
    socket.join(roomId.toString())
    console.log('Room ' + roomId  + ' created by ' + data[1])
    socket.emit('roomCreated', roomId)
  })

  //
  // Starts the sender's game
  //
  socket.on('startGame', (data) => {
    roomId = data[0]
    username = data[1]

    if (organizer.roomExists(roomId) && organizer.getRoomOwner(roomId) == username) {
      organizer.startGame(roomId)
      io.to(roomId.toString()).emit('bettingOver',0)
      let playerCount = organizer.findUsernameInGame(username).getPlayerCount()
      io.to(roomId.toString()).emit('playerCount',playerCount)
    } else {
      socket.emit('error', 'Only the room owner can start the game or room does not exist.')
    }
  })
  
  //
  // Attempts to create a room
  //
  socket.on('tryCreateRoom', async data => {
    if(!organizer.roomExists(data)){
      socket.emit('tryCreateRoomACK',[1,data])
    }
    else{
      socket.emit('tryCreateRoomACK',[0,data])
    }
  })

  //
  // Sends back all the active rooms
  //
  socket.on('getActiveRooms', async data => {
    socket.emit('getActiveRoomsACK',organizer.getActiveRooms())
  })

  //
  // Client attempts to join a room
  //
  socket.on('joinRoom', async (data) => {
    let username = data[0]
    let roomId = data[1]
    if (organizer.roomExists(roomId)) {
      let balance = await handler.getUserBalance(username)
      let isAvailable = organizer.addPlayerToRoom(roomId, username, balance)
      if(isAvailable){
        socket.join(roomId.toString())
        console.log(username + ' successfully joined room ' + roomId)
        io.to(roomId.toString()).emit('joinedRoom', [roomId,organizer.getPlayers(roomId),organizer.findGameById(roomId).getWaitingPlayers()])
        socket.emit('balanceUPDT',balance)
        if(organizer.getRoomOwner(roomId) == username){
          socket.emit('startButton', 1)
        } 
      }
      socket.emit('joinedRoomIsFull', [username,roomId])
    } else {
      socket.emit('error', 'Room not found')
    }
  })

  //
  // Client asks to join the first available match
  //
  socket.on('quickMatch', async (data) => {
    let roomId = organizer.quickMatch(data)
    socket.join(roomId.toString())
    socket.emit('quickMatchACK', roomId)
  })


  //
  // All the clients in a room ask for the start button but only the owner recieves it
  //
  socket.on('getStartButton', data => {
    let game = organizer.findUsernameInGame(data)
    if(game.getOwner() == data && !game.getRunning()){
      if(game.getOver()){
        socket.emit('giveClearHands',data)
      }
      else{
        socket.emit('startButton',data)
      }
    }
  })
  

  //
  // Client attempts to register
  //
  socket.on('clientRegister', async data => {
    console.log('Register attempt: ' + data)
    let exists = await handler.checkIfUserExists(data[0])
    if(!exists){
      handler.createUser(data[0],data[1])
      socket.emit('registerACK',1)
    }
    else{
      socket.emit('registerACK',0)
    }
  })

  //
  // Client attempts to log in
  //
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
  

  //
  // Sends all the information of a player's cards.
  // Each player asks for the cards and the information is sent to everyone in the game so other players see each other's cards.
  //
  socket.on('getCards',data =>{
    let game = organizer.findUsernameInGame(data)
    let roomId = game.getId()
    let cards = game.getPlayer(data)
    io.to(roomId.toString()).emit('giveCards',[cards])
    io.to(roomId.toString()).emit('giveDealer',[game.getDealer()._cards[0]])
    socket.emit('giveBlackJacks',[game.getBlackjacks()])
    if(game.getOver()){
      socket.emit('revealDealerCard',game.getDealer())
      socket.emit('giveDealerMore',game.getDealer())
      let gameOverState = game.getGameOverPlayers()
      game.gameOver()
      handler.updateUserGameInfo(gameOverState)
      socket.emit('gameOver',gameOverState)
    }
    else{
      let currentPlayer = game.getCurrentPlayerUsername()
      io.to(roomId.toString()).emit('playerTurn',currentPlayer)
      if(game.getPlayer(currentPlayer).getBalance() >= game.getPlayer(currentPlayer).getBet()){
        io.to(roomId.toString()).emit('canDouble', [currentPlayer])
      }
      if(game.getPlayer(currentPlayer).getCanSplit()){
        io.to(roomId.toString()).emit('canSplit', [currentPlayer])
      }
    }
  })


  //
  // This handles the actions of the players
  //
  socket.on('action', data =>{
    console.log("user action: " + data)
    let datas = data.split(":")
    let username = datas[0]
    let action = datas[1]
    let currentPlayer = ""
    let game = organizer.findUsernameInGame(username)
    let roomId = game.getId()
    switch(action){
      case "split":
        game.playerSplit(username)
        let playerCards = game.getPlayer(username)
        io.to(roomId.toString()).emit('split',playerCards)
        break
      case "double":
        socket.emit('doubleACK', 1)
        game.playerDouble(username)
        let cards = game.getPlayer(username)
        socket.emit('balanceUPDT',game.getPlayer(username).getBalance())
        io.to(roomId.toString()).emit('giveCard',cards)
        if(game['_roundOver']){
          console.log("ROUNDOVER")
          io.to(roomId.toString()).emit('revealDealerCard',game.getDealer())
          io.to(roomId.toString()).emit('giveDealerMore',game.getDealer())
          let gameOverState = game.getGameOverPlayers()
          game.gameOver()
          handler.updateUserGameInfo(gameOverState)
        io.to(roomId.toString()).emit('gameOver',gameOverState)
        break
        }
        currentPlayer = game.getCurrentPlayerUsername()
        io.to(roomId.toString()).emit('playerTurn',currentPlayer)
        if(game.getPlayer(currentPlayer).getCanSplit()){
          io.to(roomId.toString()).emit('canSplit', [currentPlayer])
        }
      case "hit":
        // canHit is a variable that has 2 bools to show if a player can still play the game or not after hitting
        let canHit = game.playerHit(username)
        if(canHit[0]){
          let cards = game.getPlayer(username)
          io.to(roomId.toString()).emit('giveCard',cards)
          if(game.getPlayer(username).getHasSplit() && game.getPlayer(username).getCards().length == 1){
            io.to(roomId.toString()).emit('changedSplitIndex',username)
          }
          if(canHit[1]){
            socket.emit('playerLose',game.getPlayer(username).getLose())
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
        console.log("stand : " + game.getOver())
        game.playerStand(username)
        if(game.getPlayer(username).getHasSplit()){
          io.to(roomId.toString()).emit('changedSplitIndex',username)
        }
        if(game.getOver()){
          io.to(roomId.toString()).emit('revealDealerCard',game.getDealer())
          io.to(roomId.toString()).emit('giveDealerMore',game.getDealer())
          let gameOverState = game.getGameOverPlayers()
          game.gameOver()
          handler.updateUserGameInfo(gameOverState)
          io.to(roomId.toString()).emit('gameOver',gameOverState)
          break
        }
        currentPlayer = game.getCurrentPlayerUsername()
        io.to(roomId.toString()).emit('playerTurn',currentPlayer)
        if(game.getPlayer(currentPlayer).getCanSplit()){
          io.to(roomId.toString()).emit('canSplit', [currentPlayer])
        }
        break
    }
  })


  //
  // After all the players have seen the result of the game, only the owner recieves the clear hand button to press.
  //
  socket.on('requestNewGame', data => {
    console.log('requestNewGame: ' + data)
    game = organizer.findUsernameInGame(data)
    if(game.getOwner() == data){
      socket.emit('giveClearHands')
    }
  })

  //
  //  All the players remove the game elements and reset
  //
  socket.on('clearHands', data => {
    game = organizer.findUsernameInGame(data)
    roomId = game.getId()
    io.to(roomId.toString()).emit('clearHandsACK', game.getOwner())
  })

  
  
  //
  // Client attempts to add to their bet
  //
  socket.on('addBet', data => {
    let value = data[1]
    let username = data[0]
    socket.emit('betACK',organizer.findUsernameInGame(username).getPlayer(username).addBet(value))
    socket.emit('balanceUPDT',organizer.findUsernameInGame(username).getPlayer(username).getBalance())
  })

  //
  // After a player disconnects we need to remove them from their current game and handle it if they were the owner of the game.
  //
  socket.on('playerDisconnect', data => {
    if(organizer.findUsernameInGame(data) != undefined){
      let game = organizer.findUsernameInGame(data)
      let currentPlayer = game.getCurrentPlayerUsername()
      let roomId = organizer.removePlayer(data)
      io.to(roomId.toString()).emit('playerDisconnectClient',data)
      io.to(roomId.toString()).emit('playerTurn',currentPlayer)
      if(game.getPlayer(currentPlayer) != ''){
        if(game.getPlayer(currentPlayer).getCanSplit()){
          io.to(roomId.toString()).emit('canSplit', [currentPlayer])
        }
      }
      console.log(data + " has disconnected")
    }
  })

  //
  // Adming message to display all the usernames
  //
  socket.on('getAllUsernames', async data => {
    let outData = await handler.getAllUsernames()
    socket.emit('getAllUsernamesACK',outData)
  })

  //
  // Admin message to recieve all the information about a certain player
  //
  socket.on('getUserInformation', async data => {
    let outData = await handler.getUserInformation(data)
    socket.emit('getUserInformationACK',outData)
  })

  //
  // Admin message to delete a chosen user
  //
  socket.on('deleteUser', async data => {
    let result = await handler.deleteUser(data)
    socket.emit('deleteUserACK',result)
  })

  //
  // Admin message to display the dates of all the player's signup
  //
  socket.on('getUserSignupDates', async data => {
    let result = await handler.getUserSignUpMonths()
    socket.emit('getUserSignupDatesACK',result)
  })

  //
  // Admin message to display the balances
  //
  socket.on('getUserBalanceCharts', async data => {
    let result = await handler.getUserBalances()
    socket.emit('getUserBalanceChartsACK', result)
  })

  //
  // Admin message to display the winrate of all the players summed up
  //
  socket.on('getWinRate', async data => {
    let result = await handler.getWinRate()
    socket.emit('getWinRateACK',result)
  })

  //
  // Admin message to recieve the activity of a chosen player
  //
  socket.on('getUserActivity', async data => {
    let result = await handler.getUserActivity(data)
    socket.emit('getUserActivityACK',result)
  })


  //
  // Admin message to display all the player's currently playing
  //
  socket.on('getCurrentUsers', async data => {
    let result = organizer.getActivePlayers()
    socket.emit('getCurrentUsersACK',result)
  })

  //
  // Admin message to display all the current games
  //
  socket.on('getCurrentGames', async data => {
    let result = organizer.getActiveGames()
    socket.emit('getCurrentGamesACK',result)
  })

  //
  // Recieving the leaderboard of all the players in order of their balances
  //
  socket.on('getLeaderBoard', async data => {
    let result = await handler.getLeaderBoard()
    socket.emit('getLeaderBoardACK', result)
  })

})

const port = process.env.PORT || 3000
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})