const gameOperator = require("./gameOperator.js")

class GamesOrganizer {

    _games = {}

    constructor() {
        this._games = {}
    }

    addGame(owner,roomId = 0,status = 'Public') {
        if (this._games[roomId]) {
            console.error("Room ID already exists")
            return false
        }
        this._games[roomId] = new gameOperator(roomId,owner,status)
        console.log("New game created with room ID:" + roomId + " By: " + owner)
        return true
    }

    getRoomOwner(roomId){
        return this._games[roomId].getOwner()
    }

    removeGame(roomId) {
        if (this._games[roomId] && this._games[roomId].getPlayerCount() === 0) {
            delete this._games[roomId]
            console.log(`Room ${roomId} deleted due to inactivity.`)
            return true
        }
        return false
    }

    findUsernameInGame(username) {
        for (let roomId in this._games) {
            if (this._games[roomId].playerExists(username)) {
                return this._games[roomId]
            }
        }
        return null
    }

    addPlayerToRoom(roomId, username, balance) {
        if (!this._games[roomId]) {
            console.log(`Room ${roomId} does not exist, creating new room.`)
            this.addGame(username,roomId)
        }

        const game = this._games[roomId]
        
        if(game.getRunning()){
            if(game.getPlayerCount() + game.getWaitingCount() < 5){
                game.addPlayerAfterGameOver(username,balance)
                return true
            }
            else {
                console.error(`Room ${roomId} will be full.`)
                return false
            }
        }
        else{
            if (game.getPlayerCount() < 5) {
                game.addExistingPlayer(username, balance)
                return true
            } 
            else {
                console.error(`Room ${roomId} is full.`)
                return false
            }
        }
    }

    quickMatch(username){
        let games = this.getAvailableRooms()
        if(games == ''){
            return this.createNewGame(username)
        }
        else{
            return games[0]
        }
    }

    setStatus(roomId,to){
        this.findGameById(roomId).setStatus(to)
    }

    createNewGame(owner,newRoomId = 0) {
        let roomId
        if(newRoomId < 999999 && newRoomId > 0){
            roomId = newRoomId
        }
        else{
            do {
                roomId = Math.floor(1 + Math.random() * 999999)
            } while (this._games[roomId])
        }
        this.addGame(owner,roomId)
        return roomId
    }

    roomExists(roomId) {
        return this._games.hasOwnProperty(roomId)
    }
    

    //TODO:FIX THIS
    handlePlayerAction(roomId, username, action){
        const game = this.findUsernameInGame(username)
        if (game) {
            switch (action) {
                case 'hit':
                    game.playerHit(username)
                    break
                case 'stand':
                    game.playerStand(username)
                    break
                case 'double':
                    game.playerDouble(username)
                    break
                case 'split':
                    game.playerSplit(username)
                    break
                default:
                    console.error(`Unknown action: ${action}`)
            }
        } else {
            console.error(`User ${username} not found in any game.`)
        }  
    }

    findGameById(roomId){
       if(this._games[roomId]){
        return this._games[roomId]
       }
       else{
        return null
       }
    }

    getPlayers(roomId){
        let game = this.findGameById(roomId)
        if(game){
            return game.getPlayers()
        }
        else{
            return null
        }
    }

    getBlackjacks(roomId){
        return this.getGameByRoomId(roomId).getBlackjacks()
    }

    removePlayer(username){
        let game = this.findUsernameInGame(username)
        game.removePlayer(username)
        if(game.getPlayerCount() == 0){
            delete this._games[game.getId()]
        }
        else if(username == game.getOwner()){
            game.setOwner(game.getPlayers()[0].getUsername())
        }
        return game.getId()
    }

    getActivePlayers(){
        let result = []
        let players = []
        for (let roomId in this._games) {
            players = this._games[roomId].getPlayers()
            for(let i=0; i < players.length; i++){
                result.push([roomId,players[i].getUsername(),players[i].getBalance()])
            }
        }
        return result
    }

    getActiveGames(){
        let result = []
        let players = 0
        for (let roomId in this._games) {
            players = this._games[roomId].getPlayers()
            result.push([roomId,players.length])
        }
        return result
    }

    startGame(roomId){
        console.log(roomId + " started the game")
        this._games[roomId].startGame()
    }

    getActiveRooms() {
        return Object.keys(this._games).filter(key => this._games[key]._status === 'Public')
    }

    getAvailableRooms() {
        return Object.keys(this._games).filter(key => (this._games[key]._status === 'Public' && this._games[key].getPlayerCount() < 5))
    }
    

    getGameByRoomId(roomId) {
        return this._games[roomId] || null
    }
}

module.exports = GamesOrganizer