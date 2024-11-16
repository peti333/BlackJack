//const socket = io('http://localhost:3000')
const socket = io()
const loginButton = document.getElementById('loginButton')
const registerButton = document.getElementById('registerButton')
const loginForm = document.getElementById('login')
const username = document.getElementById('usernameInput')
const password = document.getElementById('passwordInput')
const userlabel = document.getElementById('userLabel')
const passwordlabel = document.getElementById('passwordLabel')
const communication = document.getElementById('communication')
const hitButton = document.getElementById('hit')
const standButton = document.getElementById('stand')
let splitButton = document.getElementById('split')
let doubleDownButton = document.getElementById('doubleDown')
const table = document.getElementById('table')
const navbar = document.getElementById('navbar')
const title = document.getElementById('title')
const leaderboard = document.getElementById('leaderboard')
const rules = document.getElementById('rules')
const betFive = document.getElementById('betFive')
const betTwenty = document.getElementById('betTwenty')
const betFifty = document.getElementById('betFifty')
const betHundred = document.getElementById('betHundred')
let betCircle = document.getElementById('bet')
const bets = document.getElementById('bets')
const actions = document.getElementById('actions')
const dealer = document.getElementById('dealer')
let profile = document.getElementById('profile')
let playerHand = document.getElementById('playerHand')
let dealerHand = document.getElementById('dealerHand')
const popUp = document.getElementById('popUp')
const balance = document.getElementById('balance')

//
// L O C A L  V A R I A B L E S
//

let betValue = 0
let betAddValue = 0
let dealed = 0
let currentPlayerUsername = ''
let lastCurrentPlayer
let otherPlayer
let playerIndex = 1
let roomCode = 0
let clientUsername = ""
let otherPlayers = []
let blackJack = false
let dealerBlackJack = false
let splitting = 0


//
// -------------
// F U N C T I O N S
// -------------
//



/**
 * Helper function to create a player container if it doesn't exist
 */
function createOtherPlayerContainer(username) {
    const playerHTML = `
        <div id="${username}" class="player">
            ${username}
            <div id="hand-${username}" class="hand" style="display: inline-block"></div>
            <div id="hand-${username}-split" class="hand split" style="display: inline-block margin-left: 20px"></div>
        </div>`
    document.getElementById('table').insertAdjacentHTML('beforeend', playerHTML)
    return document.getElementById(username)
}

/**
 * Helper function to get or create the main hand for another player
 */
function getOrCreateOtherPlayerHand(username) {
    return document.getElementById(`hand-${username}`) || createOtherPlayerHand(username)
}

function createOtherPlayerHand(username) {
    const playerContainer = document.getElementById(username)
    const handHTML = `<div id="hand-${username}" class="hand" style="display: inline-block"></div>`
    playerContainer.insertAdjacentHTML('beforeend', handHTML)
    return document.getElementById(`hand-${username}`)
}

/**
 * Helper function to get or create the split hand for another player
 */
function getOrCreateSplitHand(username) {
    return document.getElementById(`hand-${username}-split`) || createSplitHand(username)
}

function createSplitHand(username) {
    const playerContainer = document.getElementById(username)
    const splitHandHTML = `<div id="hand-${username}-split" class="hand split" style="display: inline-block margin-left: 20px"></div>`
    playerContainer.insertAdjacentHTML('beforeend', splitHandHTML)
    return document.getElementById(`hand-${username}-split`)
}




function createAndAnimateCard(cardData, playerHand, cardIndex, splitInfo = 0) {
    // Create the card div and set initial position at the deck
    let cardDiv = document.createElement('div')
    cardDiv.classList.add('card')
    
    if(splitInfo == 1){
        cardDiv.classList.add('activeCard')
    }

    // Get the deck position
    const deck = document.getElementById('deck')
    const deckRect = deck.getBoundingClientRect()

    // Set initial position to the deck's position
    cardDiv.style.position = 'absolute'  // Start absolutely positioned
    cardDiv.style.top = `${deckRect.top}px`    // Start position
    cardDiv.style.left = `${deckRect.left}px`  // Start position

    // Check if it's a hidden card (if cardData is 0)
    if (cardData == 0) {
        cardDiv.id = 'hiddenCard'
        cardDiv.innerHTML = `
            <div class="top">
                <span class="number">?</span>
                <span class="suit">?</span>
            </div>
            <div class="bottom">
                <span class="suit">?</span>
                <span class="number">?</span>
            </div>
        `
    } else {

        cardDiv.innerHTML = `
            <div class="top">
                <span class="number">${getValueSymbol(cardData.value)}</span>
                <span class="suit" style="color: ${cardData.suit === 'spades' || cardData.suit === 'clubs' ? '#A26DCB' : '#63DADE'}">
                    ${getSuitSymbol(cardData.suit)}
                </span>
            </div>
            <div class="bottom">
                <span class="suit" style="color: ${cardData.suit === 'spades' || cardData.suit === 'clubs' ? '#A26DCB' : '#63DADE'}">
                    ${getSuitSymbol(cardData.suit)}
                </span>
                <span class="number">${getValueSymbol(cardData.value)}</span>
            </div>
    `
    }

    // Append to body for initial animation effect
    document.body.appendChild(cardDiv)

    // Calculate the destination position for the card
    const handRect = playerHand.getBoundingClientRect()
    const moveX = handRect.left - deckRect.left
    const moveY = handRect.top - deckRect.top

    // Calculate the additional offset for the second card
    const cardWidth = cardDiv.offsetWidth
    const additionalOffset = cardIndex * (cardWidth - 10) // Adjust based on card index (0 for first, 1 for second)

    // Update the moveX to account for the additional offset
    cardDiv.style.setProperty('--moveX', `${moveX + additionalOffset}px`)
    cardDiv.style.setProperty('--moveY', `${moveY}px`)
    cardDiv.classList.add('fly')  // Start animation

    // After animation, move card to the player's hand
    cardDiv.addEventListener('animationend', () => {
        // Remove the animation classes
        cardDiv.classList.remove('fly')

        // Append the card to the player's hand
        playerHand.appendChild(cardDiv)  // Add to player hand

        // Position the card correctly in the player's hand
        cardDiv.style.position = 'absolute' // Keep card absolute for positioning
        cardDiv.style.left = `${(playerHand.children.length - 1) * (cardWidth - 10)}px` // Adjust for spacing
        cardDiv.style.top = '0' // Reset vertical positioning if needed
    })
}


// Helper function to get the correct suit symbol for a card
function getSuitSymbol(suit) {
    switch (suit) {
        case 'hearts':
            return '♥' // Heart symbol
        case 'diamonds':
            return '♦' // Diamond symbol
        case 'clubs':
            return '♣' // Club symbol
        case 'spades':
            return '♠' // Spade symbol
        default:
            return '' // No suit if invalid
    }
}

function getValueSymbol(value) {
    switch (value) {
        case 1:
            return 'A'  // Ace
        case 11:
            return 'J'  // Jack
        case 12:
            return 'Q'  // Queen
        case 13:
            return 'K'  // King
        default:
            return value  // For numbers 2-10, return the number itself
    }
}






//
//  Recieve one card to player
//


//
//  First 2 cards for every player
//
socket.on('giveCards', data => {

    let getCards = data[0]['_cards']
    let getUsername = data[0]['_username']

    if (getUsername === username.value) {
        let playerHand = document.getElementById('playerHand')
        createAndAnimateCard(getCards[0][0], playerHand, 0)
        setTimeout(() => {
            createAndAnimateCard(getCards[0][1], playerHand, 1)
        }, 400)
    } else {
        let otherPlayerHand = document.getElementById('hand-' + getUsername)

        if (!otherPlayerHand) {
            table.innerHTML += `<div id="${getUsername}" class="player">${getUsername}<div id="hand-${getUsername}" class="hand"></div></div>`
            otherPlayerHand = document.getElementById('hand-' + getUsername)
        }

        createAndAnimateCard(getCards[0][0], otherPlayerHand, 0)
        setTimeout(() => {
            createAndAnimateCard(getCards[0][1], otherPlayerHand, 1)
        }, 400)
    }
})

socket.on('giveCard', data => {
    let { _cards: getCards, _username: getUsername, _splitIndex } = data
    let cardToAdd, targetHand

    let hasSplit = getCards.length == 2

    console.log(JSON.stringify(getCards))

    if(hasSplit){
        if((getCards[0].length == 5 && getCards[1].length == 1) || splitting == 0){
            _splitIndex = 0
        }
        if((getCards[0].length == 5 && getCards[1].length == 5) || _splitIndex == 2){
            _splitIndex = 1
            hasSplit = 0
        }
    }


    if (getUsername === username.value) {
        // Main player logic
        const playerHandSplit = document.getElementById('playerHandSplit')

        if (_splitIndex === 0) {
            cardToAdd = getCards[0].slice(-1)[0]  // Last card in main hand
            targetHand = document.getElementById('playerHand')

            // Adjust split hand position based on number of cards in main hand
            playerHandSplit.style.marginLeft = `${getCards[0].length * 50 + 20}px`
        } else {
            cardToAdd = getCards[1].slice(-1)[0]  // Last card in split hand
            targetHand = playerHandSplit
        }
        
        createAndAnimateCard(cardToAdd, targetHand, getCards[_splitIndex].length - 1,hasSplit)
    } else {
        // Logic for other players
        targetHand = _splitIndex === 0 
                     ? getOrCreateOtherPlayerHand(getUsername) 
                     : getOrCreateSplitHand(getUsername)
        
        cardToAdd = getCards[_splitIndex].slice(-1)[0]
        createAndAnimateCard(cardToAdd, targetHand, getCards[_splitIndex].length - 1,hasSplit)
    }
})


/////////////////////////////////////////////////////////////////////
//
// S O C K E T  E V E N T S
//
/////////////////////////////////////////////////////////////////////



//
// Message from server that the game is about to start and the betting phase is over  
//
socket.on('bettingOver', data => {
    betAddValue = 0
    betFive.style.visibility = "hidden"
    betTwenty.style.visibility = "hidden"
    betFifty.style.visibility = "hidden"
    betHundred.style.visibility = "hidden"
    document.getElementById('dealer').hidden = false
    actions.style.visibility = "hidden"
    actions.hidden = true
    console.log("GETCARDS")
    socket.emit("getCards",clientUsername)
})


//
//  Message from the server proividing the dealer's card
//
socket.on('giveDealer', data => {
    dealerHand = document.getElementById('dealerHand')
    console.log("dealerHand: " + dealerHand)
    
    if (dealed == 0) {
        const cardsToDeal = data[0]

        createAndAnimateCard(cardsToDeal[0], dealerHand, 0)
        setTimeout(() => {
            createAndAnimateCard(0, dealerHand, 1)
        }, 400)
        dealed = 1
    }
})


//
//  Recieving the remaining cards of the dealer
//
socket.on('giveDealerMore', data => {
    dealerHand = document.getElementById('dealerHand')
    let getCards = data['_cards'][0]

    for (let i = 2; i < getCards.length; i++) {
        setTimeout(() => {
            createAndAnimateCard(getCards[i], dealerHand, i)
        }, 400 * i) 
    }

})

//
// Reveals the hidden card of the dealer
//
socket.on('revealDealerCard', data => {
    setTimeout(function() {
        let getCards = data['_cards'][0]
    
        let hiddenCard = document.getElementById('hiddenCard')
    
        let currentNumberTop = hiddenCard.querySelector('.top .number')
        let currentSuitTop = hiddenCard.querySelector('.top .suit')
        let currentNumberBottom = hiddenCard.querySelector('.bottom .number')
        let currentSuitBottom = hiddenCard.querySelector('.bottom .suit')
    
        currentNumberTop.classList.add('fade-out')
        currentSuitTop.classList.add('fade-out')
        currentNumberBottom.classList.add('fade-out')
        currentSuitBottom.classList.add('fade-out')
    
        setTimeout(() => {
            currentNumberTop.innerHTML = getValueSymbol(getCards[1]['value'])
            currentSuitTop.innerHTML = getSuitSymbol(getCards[1]['suit'])
            currentSuitTop.style.color = getCards[1]['suit'] === 'spades' || getCards[1]['suit'] === 'clubs' ? '#A26DCB' : '#63DADE'
            currentNumberBottom.innerHTML = getValueSymbol(getCards[1]['value'])
            currentSuitBottom.innerHTML = getSuitSymbol(getCards[1]['suit'])
            currentSuitBottom.style.color = getCards[1]['suit'] === 'spades' || getCards[1]['suit'] === 'clubs' ? '#A26DCB' : '#63DADE'
    
            currentNumberTop.classList.remove('fade-out')
            currentSuitTop.classList.remove('fade-out')
            currentNumberBottom.classList.remove('fade-out')
            currentSuitBottom.classList.remove('fade-out')
            currentNumberTop.classList.add('fade-in')
            currentSuitTop.classList.add('fade-in')
            currentNumberBottom.classList.add('fade-in')
            currentSuitBottom.classList.add('fade-in')
        }, 500)
    }, 500)
})


//
// Signals which player's turn it is, only 1 player can act at a time
//
socket.on('playerTurn',data => {
    profile = document.getElementById('profile')
    otherPlayer = document.getElementById('profile-' + data)
    lastCurrentPlayer = document.getElementById('profile-' + currentPlayerUsername)
    if(data == clientUsername){
        if(dealerBlackJack){
            socket.emit('action',clientUsername + ':stand')
            dealerBlackJack = false
        }
        else if(blackJack){
            socket.emit('action',clientUsername + ':stand')
            blackJack = false
        }
        else{
            profile.classList.add("activeProfile")
            actions.style.visibility = "visible"
            actions.hidden = false
        }
    }
    else{
        actions.style.visibility = "hidden"
        actions.hidden = true
        if(otherPlayer){
            otherPlayer.style.border = "2px solid #1e0930"
        }
        profile.classList.remove("activeProfile")
    }
    if(currentPlayerUsername !== "" && data !== currentPlayerUsername && lastCurrentPlayer !== null){
        lastCurrentPlayer.style.border = ""
        lastCurrentPlayer.classList.remove("activeProfile")
    }
    currentPlayerUsername = data
})


//
//  If a player has Split their hands, this will help indicate which one of their hands is active
//
socket.on('changedSplitIndex', data => {
    if(splitting == 0){
        let activeCards = document.getElementsByClassName('activeCard')
        Array.from(activeCards).forEach(card => {
            card.classList.remove('activeCard')
        })
        if(data == clientUsername){
            document.getElementById('playerHandSplit').children[0].classList.add('activeCard')
        }
        else{
            document.getElementById('hand-' + data + '-split').children[0].classList.add('activeCard')
        }
        splitting++
    }
    else{
        let activeCards = document.getElementsByClassName('activeCard')
        Array.from(activeCards).forEach(card => {
            card.classList.remove('activeCard')
        })
        splitting = 0
    }

})

//
//  If a player wins or loses before all the players are done playing (Exceeded the limit of 21 or got 5 cards) then we display it as it happens
//
socket.on('playerLose', data => {
    actions.style.visibility = "hidden"
    actions.hidden = true
    setTimeout(function(){
        popUp.style.visibility ="visible"
        popUp.classList.add('popUpGrow')
        popUp.innerText = ""
        if(data.length == 2){
            switch(data[0]){
                case -1:
                    popUp.innerText = "You Lose"
                    break
                case 0:
                    popUp.innerText = "You Tie"
                    break
                case 1:
                    popUp.innerText = "You Win"
                    break
            }
            switch(data[1]){
                case -1:
                    popUp.innerText += " & You Lose"
                    break
                case 0:
                    popUp.innerText += " & You Tie"
                    break
                case 1:
                    popUp.innerText += " & You Win"
                    break
            }
        }
        else if(data == 1){
            popUp.innerText = "YOU WIN"
        }
        else{
            popUp.innerText = "YOU LOSE"
        }
    },1000)
})


//
// Recieves the players' and the dealer's username if they have a blackJack 
//
socket.on('giveBlackJacks', data => {
    for(let i = 0; i < data[0].length; i++){
        if(data[0][i] == clientUsername){
            blackJack = true
            document.getElementById('actions').hidden = true
            document.getElementById('actions').style.visibility = "hidden"
            setTimeout(function(){
                popUp.style.visibility ="visible"
                popUp.classList.add('popUpGrow')
                popUp.innerText = "Blackjack!"
            },1000)
        }
        if(data[0][i] == 'dealer'){
            dealerBlackJack = true
        }
    }
})

//
// Acknowledgment of the bet. Validates that the player does have money to use, and changes the displayed bet amount.
//
socket.on('betACK', data => {
    if(data != 0){   
    betValue += betAddValue
    betCircle.innerHTML = "<p>" + betValue + "$</p>"
    }
})

//
// Acknowledgment of the player doubling down
//
socket.on('doubleACK', data => {
    betValue *= 2
    betCircle.innerHTML = "<p>" + betValue + "$</p>"
})


//
// Recieves the current player's username if that player has the ability to split
//
socket.on('canSplit', data => {
    console.log(JSON.stringify(data))
    if(data == clientUsername){
        splitButton = document.getElementById('split')
        splitButton.style.visibility = "visible"
    }
})


//
// Updates the client's displayed balance with the database's stored amount
//
socket.on('balanceUPDT', data => {
    balance.innerHTML = data + '$' 
    console.log('balanceUPDT: ' + data)
})


//
// Recieves information that the current player has split their hands
//
socket.on('split', data => { 
    const { _cards: [firstCards, secondCards], _username: getUsername } = data

    //If the client was the one splitting
    if (getUsername === username.value) {
        const playerHand = document.getElementById('playerHand')
        const playerHandSplit = document.getElementById('playerHandSplit')

        betCircle.innerText = betValue * 2 + '$'

        playerHand.innerHTML = ''
        playerHandSplit.innerHTML = ''
        playerHandSplit.hidden = false
        splitButton = document.getElementById('split')
        splitButton.style.visibility = "hidden"
        doubleDownButton = document.getElementById('doubleDown')
        doubleDownButton.style.visibility = "hidden"

        playerHand.style.display = 'inline-block'
        playerHandSplit.style.display = 'inline-block'
        playerHandSplit.style.marginLeft = '20px'

        playerHand.style.border = 'none'
        playerHandSplit.style.border = 'none'

        createAndAnimateCard(firstCards[0], playerHand, 0,1)
        createAndAnimateCard(secondCards[0], playerHandSplit, 0)

    } 
    //If a different player has split their hand
    else {
        const otherPlayerHand = getOrCreateOtherPlayerHand(getUsername)
        const otherPlayerHandSplit = getOrCreateSplitHand(getUsername)

        otherPlayerHand.style.display = 'inline-block'
        otherPlayerHandSplit.style.display = 'inline-block'
        otherPlayerHandSplit.style.marginLeft = '20px'

        if (otherPlayerHand.children.length > 1) {
            otherPlayerHand.removeChild(otherPlayerHand.children[1])
        }
        otherPlayerHand.children[0].classList.add('activeCard')
        createAndAnimateCard(secondCards[0], otherPlayerHandSplit, 0)
    }
})


//
// Recieves information about the game ending and the players' result of the game
//
socket.on('gameOver', data => {
    actions.style.visibility = "hidden"
    actions.hidden = true
    splitButton.style.visibility= "hidden"
    doubleDownButton.style.visibility = "hidden"
    setTimeout(function(){
        for(let i = 0; i < data.length; i++){
            if(data[i][0] == username.value){
                popUp.style.visibility ="visible"
                popUp.classList.add('popUpGrow')
                popUp.innerText = ""
                document.getElementById('balance').innerText = data[i][2] + '$'
                switch(data[i][1][0]){
                    case -1:
                        popUp.innerText = "You Lose"
                        break
                    case 0:
                        popUp.innerText = "You Tie"
                        break
                    case 1:
                        popUp.innerText = "You Win"
                        break
                }
                switch(data[i][1][1]){
                    case -1:
                        popUp.innerText += " & You Lose"
                        break
                    case 0:
                        popUp.innerText += " & You Tie"
                        break
                    case 1:
                        popUp.innerText += " & You Win"
                        break
                }
            }
        }
    socket.emit('requestNewGame',clientUsername)
    },1000)
        
    
})

//
// Acknowledgment of the register attempt
//
socket.on('registerACK', data => {
    document.getElementById('loginMessage').hidden = false  
    if(data == 1){
        console.log('Register successfull')
        document.getElementById('loginMessage').innerText = "Register Successful"  
    }
    else{
        console.log('Register failed')
        document.getElementById('loginMessage').innerText = "Register Failed"
    }
})

//
// Only the game owner recieves this message and it displays the start button for them to press
//
socket.on('startButton', data => {
    document.getElementById('startGameButton').hidden = false
})

//
// Acknowledgment of the clearHands message. Proceeds to remove all elements of the played game.
//
socket.on('clearHandsACK', data => {
    splitting = 0
    playerIndex = 1
    playerHand = document.getElementById('playerHand')
    playerHand.innerHTML = ""
    playerHandSplit.innerHTML = ""
    document.getElementById('dealerHand').innerHTML = ''
    dealerHand.innerHTML = ""
    let hands = document.getElementsByClassName("hand")
    for(let i = 0; i < hands.length; i++){
        hands[i].innerHTML = ''
    }
    dealed = 0
    betAddValue = 0
    betValue = 0
    betCircle = document.getElementById('bet')
    betCircle.innerHTML = '<p> 0$ </p>'
    
    betFive.style.visibility = "visible"
    betTwenty.style.visibility = "visible"
    betFifty.style.visibility = "visible"
    betHundred.style.visibility = "visible"
    actions.style.visibility = "hidden"
    actions.hidden = true
    document.getElementById('dealer').hidden = true
    popUp.style.visibility ="hidden"
    popUp.classList.remove('popUpGrow')
    blackJack = false
    if(data == clientUsername){
        document.getElementById('startGameButton').hidden = false
    }
})

//
// Only the game owner recieves this message. Displays the clear hands button for them to press.
//
socket.on('giveClearHands', data => {
    document.getElementById('clearHandsButton').hidden = false
})

//
// Acknowledgment of the login message.
//
socket.on('loginACK', (result) => {
    if (result === 1) {
        console.log("Login successful")
        document.getElementById('loginMessage').hidden = true
        loginButton.hidden = true
        registerButton.hidden = true
        username.hidden = true
        password.hidden = true
        userlabel.hidden = true
        passwordlabel.hidden = true
        document.getElementById('ChooseButtons').hidden = false
        socket.emit('getActiveRooms')
    } else {
        console.error("Login failed")
        document.getElementById('loginMessage').innerText = "Login Failed"
        document.getElementById('loginMessage').hidden = false    
    }
})


//
// Acknowleges the quickMatch message and proceeds to direct the client to a room.
//
socket.on('quickMatchACK', data => {
    socket.emit('joinRoom', [clientUsername, data])
})


//
// Recieves all the active rooms.
//
socket.on('getActiveRoomsACK', data => {
    document.getElementById('roomsList').innerHTML = ''
    for (let i = 0; i < data.length; i++) {
        const listItem = document.createElement('li')
        listItem.innerHTML = data[i] + ' <input type="button" id="button' + i + '" class="simpleButton" value="Join Room">'
        document.getElementById('roomsList').appendChild(listItem)

        const button = listItem.querySelector('input[type="button"]')
        button.addEventListener('click', function() {
            const username = document.getElementById('usernameInput').value
            socket.emit('joinRoom', [clientUsername, data[i]])
        })
    }
})

//
// Recieves the information about a player leaving the room and removes their elements of the game.
//
socket.on('playerDisconnectClient', data => {
    playerIndex -= 1
    document.getElementById(data).remove()
    const index = otherPlayers.indexOf(data)
    if (index !== -1) {
        otherPlayers.splice(index, 1)
    }
    socket.emit('getStartButton', clientUsername)
})

//
// Message from the server if the client attempts to join a filled room
//
socket.on('joinedRoomIsFull', data => {
    document.getElementById('joinRoomMessage').innerText = "Room is full."
    document.getElementById('joinRoomMessage').hidden = false
})

//
// Successfull attempt of joining a room. client joining recieves information about all the other players.
// The players already in the room recieve information about the new player joining.
//
socket.on('joinedRoom', data => {
    console.log(JSON.stringify(data))
    document.getElementById('joinRoomMessage').hidden = true
    document.getElementById('createRoomSection').hidden = true
    document.getElementById('joinRoomSection').hidden = true
    document.getElementById('availableRooms').hidden = true
    roomCode = data[0]
    let players = data[1]
    if(data[2].length != 0){
        for(let i = 0; i < data[2].length; i++){
            players.push(data[2][i])
        }
    } 
    document.getElementById('roomCode').innerText = roomCode
    profile.innerHTML = '<p>' + clientUsername + '</p>'
    for(let i = 0; i < players.length; i++){
        let newUsername = players[i]['_username']
        if(!otherPlayers.includes(newUsername) && newUsername != clientUsername){
            let checkPosition = document.getElementsByClassName('player' + playerIndex)
            console.log(checkPosition.length)
            while(checkPosition.length > 0 || playerIndex >= 5){
                console.log(checkPosition.length)
                playerIndex = playerIndex > 5 ? 1 : (playerIndex + 1)
                checkPosition = document.getElementsByClassName('player' + playerIndex)
            }
            table.innerHTML += '<div id=' + newUsername + ' class="player' +playerIndex++ +'" >' + '<div id="profile-' +newUsername +'" class="profileBorder"><p>' + newUsername +'</p>'  + ' </div>  <div id="hand-'+ newUsername +'" class="hand"> </div>'    
            otherPlayers.push(newUsername)
        }
        
    }
    bets.hidden = false
    title.hidden = true
    table.hidden = false
    document.getElementById('bet').style.visibility = ""
    navbar.style.visibility = 'visible'
    socket.emit('loginSubmit',username.value)
})

//
// If the client attempts to manually create a room, it has to check with the server if that room code is appropriate
//
socket.on('tryCreateRoomACK', data => {
    if(data[0] == 1){
        document.getElementById('roomCode').innerText = data[1]
        document.getElementById('roomCodeLabel').innerText = data[1]
    }
    else{
        roomCode = Math.floor(1 + Math.random() * 999999)
        socket.emit('tryCreateRoom', roomCode)
    }
})

//
// After successfully creating a room manually the client recieves the room code.
//
socket.on('roomCreated', data => {
    document.getElementById('roomCode').innerText = data
})

//
// Redirects the client to the admin page
//
socket.on('redirectToAdmin', data => {
    window.location.href = data
})

//
// Recieves information that the current player is able to double down.
//
socket.on('canDouble', data => {
    if(data == username.value){
        console.log("I CAN DOUBLE")
        doubleDownButton.style.visibility = "visible"
    }
})


//
//  -------
//  E V E N T  L I S T E N E R S
//  -------
//


//
// When manually creating a room, the client can set the visibility of that room to be public or private
//
let changeRoomTypeButton = document.getElementById('changeRoomType')
changeRoomTypeButton.addEventListener('click', e => {
    changeRoomTypeButton.value = changeRoomTypeButton.value == 'Public' ? 'Private' : 'Public'
})

//
// Creating and joining a room manually
//
document.getElementById('startCreatedGame').addEventListener('click', e => {
    document.getElementById('createRoomSection').hidden = true
    socket.emit('createRoom',[roomCode,clientUsername,changeRoomTypeButton.value])
    socket.emit('joinRoom', [clientUsername,roomCode])
})

//
// Refreshes the joinable rooms when browsing
//
document.getElementById('refreshRoomsButton').addEventListener('click', () => {
    socket.emit('getActiveRooms')
})

//
// Manually join a room by inputting the room code
//
document.getElementById('joinRoomButton').addEventListener('click', () => {
    const roomId = document.getElementById('roomIdInput').value
    socket.emit('joinRoom', [clientUsername, roomId])
})

//
// Direct the client to the create room section
//
document.getElementById('createRoomButton').addEventListener('click', e => {
    document.getElementById('availableRooms').hidden = true
    document.getElementById('joinRoomSection').hidden = true
    document.getElementById('createRoomSection').hidden = false
    roomCode = Math.floor(1 + Math.random() * 999999)
    socket.emit('tryCreateRoom', roomCode)
})

//
// Direct the client to the create room section
//
document.getElementById('createRoomChooseButton').addEventListener('click' , e => {
    document.getElementById('ChooseButtons').hidden = true
    document.getElementById('createRoomSection').hidden = false
    roomCode = Math.floor(1 + Math.random() * 999999)
    socket.emit('tryCreateRoom', roomCode)
})

//
// Directs the client to the join room section
//
document.getElementById('joinRoomChooseButton').addEventListener('click', e => {
    document.getElementById('ChooseButtons').hidden = true
    document.getElementById('joinRoomSection').hidden = false
    document.getElementById('availableRooms').hidden = false
})

//
// Searches for the first available game to join and joins it
//
document.getElementById('quickMatchChooseButton').addEventListener('click', e => {
    document.getElementById('ChooseButtons').hidden = true
    socket.emit('quickMatch', clientUsername)
})

//
// Only the owner can press this button. It sends the clearHands message to remove all the game elements after the game is done.
//
document.getElementById('clearHandsButton').addEventListener('click', e => {
    socket.emit('clearHands', clientUsername)
    document.getElementById('clearHandsButton').hidden = true
})


// LOGIN BUTTON
loginButton.addEventListener('click', e => {
    const data = [username.value,password.value]
    clientUsername = username.value
    socket.emit('clientLogin',data)
    
})

// REGISTER BUTTON
registerButton.addEventListener('click', e => {
    const data = [username.value,password.value]
    socket.emit('clientRegister',data)
})


//
// Sends information about the player's action
//

//HIT: ask for another card
hitButton.addEventListener('click', e => {
    const data = username.value + ":hit"
    socket.emit('action',data)
})

//STAND: don't ask for any more cards and ends the player's turn
standButton.addEventListener('click', e => {
    const data = username.value + ":stand"
    socket.emit('action',data)
})

//SPLIT: Creates 2 hands for the player to play.
splitButton.addEventListener('click', e => {
    const data = username.value + ":split"
    socket.emit('action',data)
})

//DOUBLEDOWN: double's the bet of the player and asks for one more card. The player cannot ask for any more cards.
doubleDownButton.addEventListener('click', e => {
    const data = username.value + ":double"
    document.getElementById('doubleDown').style.visibility = "hidden"
    socket.emit('action',data)
})


// BET BUTTONS
betFive.addEventListener('click', e => {
    betAddValue = 5
    console.log("betValue: " + betAddValue)
})

betTwenty.addEventListener('click', e => {
    betAddValue = 20
    console.log("betValue: " + betAddValue)
})

betFifty.addEventListener('click', e => {
    betAddValue = 50
    console.log("betValue: " + betAddValue)
})

betHundred.addEventListener('click', e => {
    betAddValue = 100
    console.log("betValue: " + betAddValue)
})

//
// Clicking the bet circle adds the chosen bet amount to the player's bet
//
betCircle.addEventListener('click', e => {
    socket.emit('addBet', [username.value,betAddValue])
    console.log("Clicked on betCircle to add bet")
})

//
// Recognizes that the player is leaving and sends message to the server to remove them.
//
window.addEventListener('beforeunload', e => {
    socket.emit('playerDisconnect',username.value)
})

//
// Navigation on the top left
//
function openNav() {
    document.getElementById("mySidenav").style.width = "250px"
  }
  
function closeNav() {
    document.getElementById("mySidenav").style.width = "0"
}


//
// Only the owner can press this button. It sends a message to the server to start the game.
//
document.getElementById('startGameButton').addEventListener('click', () => {
    socket.emit('startGame',[roomCode,username.value])
    document.getElementById('startGameButton').hidden = true
})


//
// Buttons to go back to the main section where you can choose your way of joining a game.
//
let backButtons = document.getElementsByClassName('backButton')
Array.from(backButtons).forEach(button => {
    button.addEventListener('click', e => {
        document.getElementById('joinRoomSection').hidden = true
        document.getElementById('availableRooms').hidden = true
        document.getElementById('createRoomSection').hidden = true
        
        document.getElementById('ChooseButtons').hidden = false
    })
})
