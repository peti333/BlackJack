const socket = io('http://localhost:3000')
const optionsSelect = document.getElementById('optionsSelect')
const playerInfoButton = document.getElementById('playerInfoButton')
const playerInfoTable = document.getElementById('playerInfoTable')
const playerInfoTableBody = document.getElementById('playerInfoTableBody')
const RegisterButton = document.getElementById('RegisterButton')
const usernameInput = document.getElementById('usernameInput')
const passwordInput = document.getElementById('passwordInput')
const currentPlayerTable = document.getElementById('currentPlayerTable')


//INFORMATION
socket.emit('getAllUsernames','admin')
socket.emit('getCurrentUsers','admin')

//CHARTS
socket.emit('getUserSignupDates' , 'admin')
socket.emit('getUserBalanceCharts', 'admin')
socket.emit('getWinRate','admin')


//TODO:
socket.on('currentPlayerTableACK', data => {
    currentPlayerTable.innerHTML = ""
    data.forEach(element => {
        
    });
})

socket.on('getUserSignupDatesACK', data => {
    const months = data.map(item => item.join_month)
    const userCounts = data.map(item => item.user_count)
    const chart = document.getElementById('UserSignUpMonthChart').getContext('2d')

    const UserSignUpMonthChart = new Chart(chart, {
        type:'bar',
        data: {
            labels:months,
            datasets: [{
                label: 'Users signed up',
                data: userCounts,
                backgroundColor: 'rgba(190, 120, 183, 1)',
                borderColor: 'rgba(0, 0, 0, 1)',
                borderWidth:1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.5)'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.5)'
                    }
                }
            }
        }
    })
})

//Need better data
socket.on('getUserBalanceChartsACK', data => {
    const chart = document.getElementById('UsersBalacesChart').getContext('2d')
    const usernames = data.map(item => item.username)
    const balances = data.map(item => item.balance)

    const UserSignUpMonthChart = new Chart(chart, {
        type:'bar',
        data: {
            labels:usernames,
            datasets: [{
                label: 'Balances',
                data: balances,
                backgroundColor: 'rgba(190, 120, 183, 1)',
                borderColor: 'rgba(0, 0, 0, 1)',
                borderWidth:1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.5)'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.5)'
                    }
                }
            }
        }
    })
})



socket.on('getWinRateACK', data => {
    const chart = document.getElementById('WinRateChart').getContext('2d')
    const wins = data[0]['wins']
    const ties = data[0]['ties']
    const losses = data[0]['losses']

    const UserSignUpMonthChart = new Chart(chart, {
        type:'pie',
        data: {
            labels:[
                'Wins',
                'Ties',
                'Losses'
            ],
            datasets: [{
                data: [wins,ties,losses],
                backgroundColor: ['rgba(190, 120, 183, 1)', 'rgba(124, 77, 119,1)','rgba(228, 177, 240,1)'],
                borderColor: 'rgba(0, 0, 0, 1)',
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Total Wins, Ties, and Losses'
                }
            }
        }
    })
})

let UserActivityChart = null; // Store the chart instance

socket.on('getUserActivityACK', data => {
    const chartElement = document.getElementById('UserActivityChart');


    if (UserActivityChart) {
        UserActivityChart.destroy();
        UserActivityChart = null;
    }

    if (!data || data.length === 0) {
        chartElement.hidden = true;
        document.getElementById('UserActivityDiv').hidden = true
        return;
    }

    document.getElementById('UserActivityDiv').hidden = false

    chartElement.innerHTML = "";
    chartElement.hidden = false;
    

    let chart = chartElement.getContext('2d');
    const hours = data.map(item => item.activityByHour);
    const counts = data.map(item => item.activityCount);

    UserActivityChart = new Chart(chart, {
        type: 'line',
        data: {
            labels: hours,
            datasets: [{
                label: 'Activity',
                data: counts,
                backgroundColor: 'rgba(190, 120, 183, 1)',
                borderColor: 'rgba(255, 255, 255, 1)',
                borderWidth: 1,
                fill: false,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.5)'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.5)'
                    }
                }
            }
        }
    });
});




socket.on('getAllUsernamesACK', data => {
    optionsSelect.innerHTML = ""
    for(let i = 0; i < data.length; i++){
        optionsSelect.innerHTML += '<option value="' + data[i]['username'] +'">' + data[i]['username'] + '</option>'
    }
})

socket.on('getUserInformationACK',data => {
    playerInfoTable.hidden = false
    playerInfoTableBody.innerHTML = ""
    playerInfoTableBody.innerHTML += '<tr><td>' + data[0]['id'] +'</td><td>' + data[0]['username'] + '</td><td>' + data[0]['balance'] + '</td><td>' + data[0]['wins'] + '</td><td>' + data[0]['ties'] + '</td><td>' + data[0]['losses'] + '</td><td>' + data[0]['joined'] + '</td><td><input id="buttonHide" type="button" value="X"></td><td><input id="buttonDelete" type="button" value="Delete"></td></tr>'
    document.getElementById('buttonHide').addEventListener('click', e => {
        playerInfoTableBody.innerHTML = ""
        playerInfoTable.hidden = false
    })
    document.getElementById('buttonDelete').addEventListener('click', e => {
        playerInfoTableBody.innerHTML = ""
        playerInfoTable.hidden = false
        socket.emit('deleteUser',data[0]['username'])
    })
})

socket.on('deleteUserACK', data => {
    if(data){
        document.getElementById(data).hidden = true
    }
})

socket.on('registerACK', data => {
    socket.emit('getAllUsernames','admin')
})


// EVENT LISTENERS

playerInfoButton.addEventListener('click', e => {
    socket.emit('getUserInformation', optionsSelect.value)
    socket.emit('getUserActivity', optionsSelect.value)
})

RegisterButton.addEventListener('click', e=> {
    let data = [usernameInput.value,passwordInput.value]
    socket.emit('clientRegister', data)
})