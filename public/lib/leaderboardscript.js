const socket = io('http://localhost:3000')
leaderBoardTableBody = document.getElementById('leaderBoardTableBody')

socket.emit('getLeaderBoard',1)

socket.on('getLeaderBoardACK' , data => {
    for(let i = 0; i < data.length; i++){
        leaderBoardTableBody.innerHTML += '<tr><td>'+ data[i]['username'] +'</td><td>'+ data[i]['balance'] +'$</td></tr>'
    }
})


function openNav() {
    document.getElementById("mySidenav").style.width = "250px"
  }
  
function closeNav() {
    document.getElementById("mySidenav").style.width = "0"
}