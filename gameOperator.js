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
        this._currentPlayer = 1
    }
    playerHit(){
        //TODO: check if possible actions
        //ERROR HERE: maybe player is not added
        //TODO: change 0 -> this._currentPlayer
        let drawnCard = this._cards.drawCard()
        console.log("drawn card: " + drawnCard.getSuit() + ":" + drawnCard.getValue())
        this._players[0].addCard(drawnCard.getSuit(),drawnCard.getValue())
    }
    playerStand(){
        if(this._currentPlayer++ == this._players.length){
            this.roundOver()
        }
    }
    roundOver(){
        //TODO: check if there are live players
        //TODO: deal with ace
        let sum = this._dealer.getSum()
        while(sum < 17){
            this._dealer.addCard(this._cards.drawCard())
        }
    }
    gameOver(){
        this._cards.newDeck()
    }
    getPlayer(index){
        return this._players[index]
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
}


module.exports = GameOperator