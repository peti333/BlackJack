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
    _roundOver = false
    constructor(){
        console.log("game operator constructor called")
    }
    addPlayer(username){
        let newPlayer = new Player(username)
        //ERROR: NOT ADDED PLAYER
        this._players.push(newPlayer)
        console.log(this._players)
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
    }
    playerHit(username){
        if(this._players[this._currentPlayer].getUsername() == username){
            let drawnCard = this._cards.drawCard()
            //Debug:
            //console.log("drawn card: " + drawnCard.getSuit() + ":" + drawnCard.getValue())

            this.getPlayer(username).addCard(drawnCard.getSuit(),drawnCard.getValue())
            if(this.getPlayer(username)['_sum'] > 21){
                this.playerLose(username)
                console.log(username + "has lost")
            }
            return true
        }
        return false

    }
    playerStand(username){
        if(this._players[this._currentPlayer].getUsername() == username){
            if(++this._currentPlayer == this._players.length){
                
                this.roundOver()
                //this._currentPlayer = 0
            }
        }
        console.log(this._currentPlayer)
        
    }
    roundOver(){
        //TODO: check if there are live players
        //TODO: deal with ace
        this._roundOver = true
        let sum = this._dealer['_sum']
        while(sum < 17){
            let drawnCard = this._cards.drawCard()
            this._dealer.addCard(drawnCard.getSuit(),drawnCard.getValue())
            sum = this._dealer['_sum']
            
        }
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
    writeAllCards(){
        console.log("WriteAllCards called")
        for(let i = 0; i < this._players.length; i++){
            this._players[i].writeCards()
        }
    }
    playerLose(username){
        this.getPlayer(username).setLose(true)
    }
    playerWin(){

    }
}


module.exports = GameOperator