Card = require("./card.js")

class Player{

    _cards = []
    _sum = 0
    _hasAce = false
    _username = "default"
    _lose = false
    constructor(username = "default"){
        this._username = username
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
        if(value = 1){
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
        }
    }
    clearHand(){
        this._hasAce = false
        this._cards = []
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
    }
}

module.exports = Player