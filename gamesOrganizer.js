const gameOperator = require("./gameOperator.js");

class GamesOrganizer {

    _games = {}

    constructor() {
        this._games = {};
    }

    addGame(owner,roomId = 0) {

        if (this._games[roomId]) {
            console.error("Room ID already exists");
            return false;
        }
        this._games[roomId] = new gameOperator(roomId,owner);
        console.log("New game created with room ID:" + roomId + " By: " + owner);
        return true;
    }

    getRoomOwner(roomId){
        return this._games[roomId].getOwner()
    }

    removeGame(roomId) {
        if (this._games[roomId] && this._games[roomId].getPlayerCount() === 0) {
            delete this._games[roomId];
            console.log(`Room ${roomId} deleted due to inactivity.`);
            return true;
        }
        return false;
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
            console.log(`Room ${roomId} does not exist, creating new room.`);
            this.addGame(username,roomId);
        }

        const game = this._games[roomId];
        if (game.getPlayerCount() < 5) {
            game.addExistingPlayer(username, balance);
            console.log(`Player ${username} added to room ${roomId}`);
            return true;
        } else {
            console.error(`Room ${roomId} is full.`);
            return false;
        }
    }

    addPlayer(username, balance) {
        for (let roomId in this._games) {
            const game = this._games[roomId];
            if (game.getPlayerCount() < 5) {
                game.addExistingPlayer(username, balance);
                return roomId;
            }
        }
        const newRoomId = this.createNewGame(username);
        this._games[newRoomId].addExistingPlayer(username, balance);
        return newRoomId;
    }


    createNewGame(owner,newRoomId = 0) {
        let roomId;
        if(newRoomId < 999999 && newRoomId > 0){
            roomId = newRoomId
        }
        else{
            do {
                roomId = Math.floor(1 + Math.random() * 999999);
            } while (this._games[roomId])
        }
        this.addGame(owner,roomId);
        return roomId;
    }

    roomExists(roomId) {
        return this._games.hasOwnProperty(roomId);
    }
    

    //TODO:FIX THIS
    handlePlayerAction(roomId, username, action){
        const game = this.findUsernameInGame(username);
        if (game) {
            switch (action) {
                case 'hit':
                    game.playerHit(username);
                    break;
                case 'stand':
                    game.playerStand(username);
                    break;
                case 'double':
                    game.playerDouble(username);
                    break;
                case 'split':
                    game.playerSplit(username);
                    break;
                default:
                    console.error(`Unknown action: ${action}`);
            }
        } else {
            console.error(`User ${username} not found in any game.`);
        }  
    }

    startGame(roomId){
        console.log(roomId + " started the game")
        this._games[roomId].startGame()
    }

    getActiveRooms() {
        return Object.keys(this._games);
    }

    getGameByRoomId(roomId) {
        return this._games[roomId] || null;
    }
}

module.exports = GamesOrganizer;