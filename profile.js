/*
    User Profile
*/
class Profile{
    username = "default"
    balance = 1000
    gamesPlayed = 0
    gamesWon = 0
    gamesLost = 0
    image = ""
    betting = 0
    constructor(username){
        this.username = username
    }
    bet(value){
        if(value <= balance){
            this.betting = value
            this.balance -= value
        }
        else{
            //Throw error
        }
    }
    win(){
        this.balance += this.betting * 2
        this.gamesWon++
        this.gamesPlayed++
    }
    lose(){
        this.gamesLost++
        this.gamesPlayed++
    }
}

module.exports = {Profile}