Card = require("./card.js")

class Deck{

    _cards = []
    constructor(){
        this.newDeck()
        this.shuffle()
    }
    newDeck(){
        for(let i = 0; i < 4; i++){
            let suit = ["hearts", "diamonds", "spades", "clubs"][i]
            for(let j = 1; j <= 13; j++){
                let newCard = new Card(suit,j)
                this._cards.push(newCard)
            }
        }
    }
    //Use some interesing shuffle algorithm??
    shuffle(){
        let randomNumber = 0
        for(let i = 0; i < 52; i++){
            randomNumber = Math.floor(Math.random() * 52)
            while(randomNumber == i){
                randomNumber = Math.floor(Math.random() * 52)
            }
            [this._cards[i],this._cards[randomNumber]] = [this._cards[randomNumber], this._cards[i]]
        }
    }
    drawCard(){
        return this._cards.pop()
    }
}

module.exports = Deck