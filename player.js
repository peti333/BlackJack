Card = require("./card.js")

class Player{

    _cards = []
    _sum = 0
    _hasAce = false
    _username = "default"
    _lose = 0
    _over = false
    _bet = 0
    _balance = 100
    constructor(username = "default", balance = 100){
        this._username = username
        this._balance = balance
    }
    getUsername(){
        return this._username
    }
    addCard(suit,value){
        let newCard = new Card(suit,value)
        this._cards.push(newCard)
        if(value > 10){
            this._sum += 10
        }
        else{
            this._sum += value
        }
        if(value == 1){
            this._hasAce = true
        }
    }
    /*
    addCard(newCard){
        this._cards.push(newCard)
        if(newCard.getValue > 10){
            this._sum += 10
        }
        else{
            this._sum += newCard.getValue
        }
        if(newCard.getValue == 1){
            this._hasAce = true
        }
    }
    */
    getSum(){
        if(!this._hasAce){
            return [this._sum]
        }
        else{
            if(this._sum + 10 < 21){
                return [this._sum, 10 + this._sum]
            }
            else{
                return [this._sum]
            }
        }
    }
    clearHand(){
        this._hasAce = false
        this._bet = 0
        this._sum = 0
        this._cards = []
        this._lose = 0
        this._over = false
    }
    //TODO: remove after testing
    writeCards(){
        console.log("writeCards called")
        for(let i = 0; i < this._cards.length; i++){
            console.log(this._cards[i])
        }
        console.log("end of writeCards()")
    }
    getCards(){
        return this._cards
    }
    getLastCard(){
        return this._cards[this._cards.length - 1]
    }
    setLose(to){
        this._lose = to
        switch (to){
            case 1:
                this._balance += this._bet * 2
                break
            case 0:
                this._balance += this._bet
                break
        }
        this._bet = 0
    }
    getLose(){
        return this._lose
    }
    setOver(to){
        this._over = to
    }
    setBet(to){
        this._bet = to
        this._balance -= to
    }
    getBet(to){
        return this._bet
    }
}

module.exports = Player