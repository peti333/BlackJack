/*
    Responsible for running game
        - dealing cards
        - waiting for actions
        - determining winners and losers
*/
const Deck = require("./deck.js")
const Player = require("./player.js")

class GameOperator{

    _id = 0
    _players = []
    _waitingPlayers = []
    _dealer = new Player("dealer")
    _currentPlayer = 0
    _cards = new Deck()
    _roundOver = false
    _lostPlayers = []
    _gameRunning = false
    _timer = 0
    _status
    _owner = 'default'
    _blackJacks = []


    constructor(id, owner,status = 'Public'){
        this._id = id
        this._owner = owner
        this._status = status
    }
    addPlayer(username){
        let newPlayer = new Player(username)
        this._players.push(newPlayer)
        console.log(this._players)
    }

    addPlayerAfterGameOver(username,balance) {
        let newPlayer = new Player(username,balance)
        this._waitingPlayers.push(newPlayer)  // Add the player to the waiting list
        console.log(`${username} has been added to the waiting list`)
    }

    setStatus(to){
        this._status = to
    }

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
        this._blackJacks = []
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

    everyBodyLose(){
        console.log("everybody lose")
        this.setOver(true)
        for(let i = 0; i < this._players.length; i++){
            if (this._blackJacks.includes(this._players[i].getUsername())){
                console.log("Blackjack Tie!!!")
                this.playerTie(this._players[i].getUsername())
            }
            else{
                this.playerLose(this._players[i].getUsername())
            }
        }
    }

    checkBlackjacks(){
        for (let i = 0; i < this._players.length; i++) {
            if (this._players[i].getSum()[1] == 21) {
                this.playerBlackjack(this._players[i].getUsername())
                this._blackJacks.push(this._players[i].getUsername())
                console.log('checkJackBlacks: ' + this._currentPlayer)
            }
        }
        if (this._dealer.getSum()[1] == 21) {
            console.log("dealer blackjack")
            this._blackJacks.push('dealer')
            this.everyBodyLose()
        }
    }

    getBlackjacks(){
        let result = this._blackJacks
        return result
    }

    startGame(){
        console.log("Startgame called")
        this.clearPlayerHands()
        this._cards = new Deck()
        this.dealCards()
        this._currentPlayer = 0
        this.setOver(false)
        this._gameRunning = true
    }
    playerHit(username){
        let player = this._players[this._currentPlayer]
        if(player.getUsername() == username && player.getOver() == false){
            let drawnCard = this._cards.drawCard()
            player.addCard(drawnCard.getSuit(),drawnCard.getValue())
            if(player.getSum()[0] > 21){
                this.playerLose(username)
                this._lostPlayers.push(this.getPlayer(username))
                if(player.getHasSplit() && player.getSplitIndex() == 1){
                    //this.playerStand(username)
                    return [true,false]
                }
                return [true,true]
            }
            if(player.getCards().length == 5 && player.getSum()[0] <= 21){
                this.playerWin(username)
                if(player.getHasSplit() && player.getSplitIndex() >= 1){
                    this.playerStand()
                    if(player.getSplitIndex() == 2){
                        return [true,true]     
                    }
                    return [true,false]
                }
                return [true,true]
            }
            return [true,false]
        }
        return [false,false]

    }
    playerStand(username){
        if(this._players[this._currentPlayer].getUsername() == username){
            if(this._players[this._currentPlayer].getHasSplit() && this._players[this._currentPlayer].getSplitIndex() < 1){
                this._players[this._currentPlayer].increaseSplitIndex()
            }
            else if(this.increaseCurrentPlayer() >= this._players.length){
                this.roundOver()
            }
        }  
    }
    increaseCurrentPlayer(){
        do {
            this._currentPlayer++
        } while (this._currentPlayer < this._players.length && this._blackJacks.includes(this._players[this._currentPlayer].getUsername()))
        
        return this._currentPlayer
    }
    playerDouble(username){
        this._players[this._currentPlayer].doubleBet()
        this.playerHit(username)
        this.playerStand(username)
    }
    playerSplit(username){
        this._players[this._currentPlayer].splitHands()
    }
    roundOver(){
        console.log("OPERATOR ROUND OVER")
        this.setOver(true)
        this._gameRunning = false
        let activePlayers = []
        for(let i = 0; i < this._players.length; i++){
            console.log(this._players[i].getUsername() + ": " + !this._players[i].getOver())
            if(this._players[i].getOver() == false){
                activePlayers.push(this._players[i])
            }
        }
        if(activePlayers.length >= 1){
            let sum = this._dealer.getSum()
            if(sum.length == 2){
                sum = this._dealer.getSum()[1]
            }
            else{
                sum = this._dealer.getSum()[0]
            }
            while(sum < 17){
                let drawnCard = this._cards.drawCard()
                this._dealer.addCard(drawnCard.getSuit(),drawnCard.getValue())
                sum = this._dealer.getSum()
                if(sum.length == 2 && sum[1] <= 21 && sum[1] >= 17){
                    sum = this._dealer.getSum()[1]
                }
                else{
                    sum = this._dealer.getSum()[0]
                }
                console.log('sum: ' + sum)
            }
        }
        this.checkWin()
    }
    gameOver(){
        this._cards.newDeck()
        if (this._roundOver) {
            for (let player of this._waitingPlayers) {
                this._players.push(player)
                console.log(`${player.getUsername()} has joined the game from the waiting list.`)
            }
            this._waitingPlayers = []
        }
    }
    getPlayer(username){
        for(let i = 0; i < this._players.length; i++){
            if(this._players[i].getUsername() == username){
                return this._players[i]
            }
        }
        return ''
    }

    playerExists(username){
        for(let i = 0; i < this._players.length; i++){
            if(this._players[i].getUsername() == username){
                return true
            }
        }
        for(let i = 0; i < this._waitingPlayers.length; i++){
            if(this._waitingPlayers[i].getUsername() == username){
                return true
            }
        }
        return false
    }

    getCurrentPlayerUsername(){
        if(this._currentPlayer >= this._players.length){
            return "Dealer"
        }
        return this._players[this._currentPlayer].getUsername()
    }
    getDealer(){
        return this._dealer
    }
    
    getLostPlayers(){
        return _lostPlayers
    }
    checkWin(){
        let activePlayers = []
        for(let i = 0; i < this._players.length; i++){
            if(!this._players[i].getOver()){
                activePlayers.push(this._players[i])
            }
        }
        let playerSum = 0
        let dealerSum = this._dealer.getSum()[0]
        for(let i = 0; i < activePlayers.length; i++){
            if(activePlayers[i].getSplitIndex() >= 1){
                activePlayers[i].setSplitIndex(0)
                for(let j = 0; j <= 1; j++){
                    activePlayers[i].setSplitIndex(j)
                    playerSum = activePlayers[i].getSum()
                    if(playerSum.length == 2 && playerSum[1] <= 21){
                        playerSum = playerSum[1]
                    }
                    else{
                        playerSum = playerSum[0]
                    }
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
            else{
                playerSum = activePlayers[i].getSum()
                    if(playerSum.length == 2 && playerSum[1] <= 21){
                        playerSum = playerSum[1]
                    }
                    else{
                        playerSum = playerSum[0]
                    }
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
    }
    getPlayers(){
        return this._players
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
    playerBlackjack(username){
        this.getPlayer(username).setLose(2)
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

    getId(){
        return this._id
    }

    setOwner(username){
        this._owner = username
    }

    getOwner(){
        return this._owner
    }

    setOver(to){
        this._roundOver = to
    }

    getOver(){
        return this._roundOver
    }

    getRunning(){
        return this._gameRunning
    }

    getWaitingPlayers(){
        return this._waitingPlayers
    }

    getWaitingCount(){
        return this._waitingPlayers.length
    }
}


module.exports = GameOperator