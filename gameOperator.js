/*
    Responsible for running game
        - dealing cards
        - waiting for actions
        - determining winners and losers
*/
const Deck = require("./deck.js")
const Player = require("./player.js")

class GameOperator{

    _players = []
    _dealer = new Player("dealer")
    _currentPlayer = 0
    _cards = new Deck()
    _roundOver = true
    _lostPlayers = []
    constructor(){
    }
    addPlayer(username){
        let newPlayer = new Player(username)
        this._players.push(newPlayer)
        console.log(this._players)
    }

    //For future uses, for players that have played before
    addExistingPlayer(username,balance){
        let newPlayer = new Player(username,balance)
        this._players.push(newPlayer)
    }
    removePlayer(username){
        for(let i = 0; i < this._players.length; i++){
            if(this._players[i].getUsername() == username){
                this._players.splice(i,1)
            }
        }
    }
    dealCards(){
        this._roundOver = false
        let drawnCard
        for(let j = 0; j < 2; j++){
            for(let i = 0; i < this._players.length; i++){
                drawnCard = this._cards.drawCard()
                this._players[i].addCard(drawnCard.getSuit(),drawnCard.getValue())
            }
            drawnCard = this._cards.drawCard()
            this._dealer.addCard(drawnCard.getSuit(),drawnCard.getValue())
        }
        this.checkBlackjacks()
        
    }
    checkBlackjacks(){

    }
    startGame(){
        this._cards = new Deck()
        this.dealCards()
        this._currentPlayer = 0
        this._roundOver = false
    }
    playerHit(username){
        //console.log(this._players[this._currentPlayer['_lose']])
        if(this._players[this._currentPlayer].getUsername() == username && this._players[this._currentPlayer]['_over'] == false){
            let drawnCard = this._cards.drawCard()
            //Debug:
            //console.log("drawn card: " + drawnCard.getSuit() + ":" + drawnCard.getValue())

            this.getPlayer(username).addCard(drawnCard.getSuit(),drawnCard.getValue())
            if(this.getPlayer(username).getSum()[0] > 21){
                this.playerLose(username)
                this._lostPlayers.push(this.getPlayer(username))
                console.log(username + " has lost")
                return [true,true]
            }
            return [true,false]
        }
        return [false,false]

    }
    playerStand(username){
        if(this._players[this._currentPlayer].getUsername() == username){
            if(++this._currentPlayer == this._players.length){
                this.roundOver()
            }
        }  
    }
    roundOver(){
        let activePlayers = this._players
        if(activePlayers.length >= 1){
            this._roundOver = true
            let sum = this._dealer.getSum()[0]
            while(sum < 17){
                let drawnCard = this._cards.drawCard()
                this._dealer.addCard(drawnCard.getSuit(),drawnCard.getValue())
                sum = this._dealer.getSum()[0]
            }
        }
        this.checkWin()
    }
    gameOver(){
        this._cards.newDeck()
    }
    getPlayer(username){
        for(let i = 0; i < this._players.length; i++){
            if(this._players[i].getUsername() == username){
                return this._players[i]
            }
        }
    }
    getCurrentPlayerUsername(){
        if(this._currentPlayer == this._players.length){
            return "Dealer"
        }
        return this._players[this._currentPlayer]['_username']
    }
    getDealer(){
        return this._dealer
    }
    //ONLY FOR TESTING
    writeAllCards(){
        console.log("WriteAllCards called")
        for(let i = 0; i < this._players.length; i++){
            this._players[i].writeCards()
        }
    }
    
    getLostPlayers(){
        return _lostPlayers;
    }
    checkWin(){
        //GET PLAYERS ELIGIBLE TO WIN
        let activePlayers = this._players
        let playerSum = 0
        let dealerSum = this._dealer.getSum()[0]
        for(let i = 0; i < activePlayers.length; i++){
            playerSum = activePlayers[i].getSum()
            if(playerSum.length == 2 && playerSum[1] <= 21){
                playerSum = playerSum[1]
            }
            else{
                playerSum = playerSum[0]
            }
            this.playerTie(activePlayers[i].getUsername())
            if((playerSum > dealerSum || dealerSum > 21) && playerSum <= 21){
                this.playerWin(activePlayers[i].getUsername())
            }
            else if(playerSum == dealerSum){
                this.playerTie(activePlayers[i].getUsername())
            }
            else{
                this.playerLose(activePlayers[i].getUsername())
            }
            activePlayers[i].setOver(true)
        }
    }
    getPlayerCount(){
        return this._players.length
    }
    playerLose(username){
        this.getPlayer(username).setLose(-1)
    }
    playerWin(username){
        this.getPlayer(username).setLose(1)
    }
    playerTie(username){
        this.getPlayer(username).setLose(0)
    }
    //Make an array of [username - win/lose/tie] to send to clients
    getGameOverPlayers(){
         let data = []
         let tempPlayer
         for(let i = 0; i < this._players.length; i++){
            tempPlayer = this._players[i]
            data.push([tempPlayer.getUsername(),tempPlayer.getLose(),tempPlayer.getBalance()])
         }
         return data
    }
    clearPlayerHands(){
        for(let i = 0; i < this._players.length; i++){
            this._players[i].clearHand()
        }
        this._dealer.clearHand()
    }
}


module.exports = GameOperator