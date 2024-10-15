Card = require("./card.js")

class Player{

    _cards = [[]]
    _sum = [0]
    _hasAce = [false]
    _split = false
    _canSplit = false
    _splitIndex = 0
    _username = "default"
    _lose = [0]
    _over = [false]
    _bet = parseInt(0)
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
        this._cards[this._splitIndex].push(newCard)
        if(value > 10){
            this._sum[this._splitIndex] += 10
        }
        else{
            this._sum[this._splitIndex] += value
        }
        if(value == 1){
            this._hasAce[this._splitIndex] = true
        }
        if(this._cards[this._splitIndex].length == 2 && this._cards[this._splitIndex][0].getValue() == this._cards[this._splitIndex][1].getValue()){
            this._canSplit = true
        }
    }
    getSum(){
        if(!this._hasAce[this._splitIndex]){
            return [this._sum[this._splitIndex]]
        }
        else{
            if(this._sum[this._splitIndex] + 10 < 21){
                return [this._sum[this._splitIndex], 10 + this._sum[this._splitIndex]]
            }
            else{
                return [this._sum[this._splitIndex]]
            }
        }
    }
    splitHands(){
        this._sum = [this._cards[0][0].getValue(),this._cards[0][1].getValue()]
        this._over = [false,false]
        this._hasAce = [this._cards[0][0].getValue() == 1,this._cards[0][1].getValue() == 1]
        this._cards = [[this._cards[0][0]], [this._cards[0][1]]]
        this._bet /= 2
    }
    getHasSplit(){
        return this._cards.length == 2
    }
    clearHand(){
        this._splitIndex = 0
        this._hasAce = [false]
        this._bet = 0
        this._sum = [0]
        this._cards = [[]]
        this._lose = [0]
        this._over = [false]
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
        return this._cards[this._splitIndex]
    }
    getLastCard(){
        return this._cards[this._splitIndex][this._cards.length - 1]
    }
    setLose(to){
        console.log("setlose: " + to)
        this._lose[this._splitIndex] = to
            switch (to){
                case 1:
                    this._balance += this._bet * 2
                    break
                case 0:
                    this._balance += this._bet
                    break
            }
        this._splitIndex++
        //this._bet = 0
    }
    getLose(){
        return this._lose
    }
    setOver(to){
        this._over[this._splitIndex] = to
        if(this._cards.length == 2){this._splitIndex++}
    }
    getOver(){
        return this._over[this._splitIndex]
    }
    setBet(to){
        this._bet = to
        this._balance -= to
    }
    addBet(plus){
        let result = 0
        if(this._balance - plus >= 0){
            this._bet -= ((-1) * plus)
            this._balance -= plus
            result = plus
        }
        return result
    }
    doubleBet(){
        this._balance -= this._bet
        this._bet *= 2
    }
    getBet(){
        return this._bet
    }
    getBalance(){
        return this._balance
    }
    getSplitIndex(){
        return this._splitIndex
    }
    setSplitIndex(to){
        this._splitIndex = to
    }
    increaseSplitIndex(){
        this._splitIndex++
    }
}

module.exports = Player