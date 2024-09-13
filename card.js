class Card{
        suit = ""
        value = 0
    constructor(suit,value){
        this.suit = suit
        this.value = value
    }
    getValue(){
        return this.value
    }
    getSuit(){
        return this.suit
    }
}

module.exports = Card