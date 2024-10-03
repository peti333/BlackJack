const mysql = require('mysql2')
const argon2 = require('argon2')


const options = {
    type: argon2.argon2id,
    timeCost: 1,
    memoryCost: 65536,
    parallelism: 4,
    hash_len: 99, //MIGHT CHANGE LATER
}


/*

const database = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: 'admin',
  database: 'testDatabase'
})

database.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
  }
})
  */

/*
database.execute('INSERT INTO testing (id,username,balance) VALUES (2,"testUsernameInsert",98);', (err,results) => {
  if (err) {
    console.error(err);
  } else {
    console.log(results);
  }
});
*/
/*
const argon2 = require('argon2')
const options = {
  type: argon2.argon2id,
  timeCost: 3,
  memoryCost: 20000,
  parallelism: 4,
  hash_len: 99, //MIGHT CHANGE LATER
}



console.log('start hash')
const hash = argon2.hash("password")
.then(hashedPassword => {
  console.log('Hashed Password:', hashedPassword)
  database.execute('INSERT INTO testing (id,username,balance) VALUES (3,"'+ hashedPassword + '",98);', (err,results) => {
    if (err) {
      console.error(err);
    } else {
      console.log(results);
    }
  });
})

*/



/*
let test = "testUsername"

database.query('SELECT * FROM testing WHERE username LIKE "' + test + '" ;', (err, results) => {
  if (err) {
    console.error(err)
  } else {
    console.log(results)
    if(results.length != 0){
      console.log("username: " + results[0]['username'])
      console.log("balance: "  + results[0]['balance'])
    }
    else{
      console.log("query return null")
    }
  }
})
*/
/*
database.query('SELECT * FROM testing WHERE username LIKE "testUsername";', (err, results) => {
  if (err) {
    console.error(err);
  } else {
    console.log(results);
    if(results.length != 0){
      console.log("username: " + results[0]['username'])
      console.log("balance: "  + results[0]['balance'])
    }
    else{
      console.log("query return null")
    }
  }
});
*/

//database.end();


/*
const database = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: 'admin',
  database: 'testDatabase'
});

database.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
  }
})

*/

/*
database.execute('INSERT INTO testing (id,username,balance) VALUES (2,"testUsernameInsert",98);', (err,results) => {
  if (err) {
    console.error(err);
  } else {
    console.log(results);
  }
});
*/
/*
database.query('SELECT * FROM userData', (err, results) => {
  if (err) {
    console.error(err);
  } else {
    console.log(results);
  }
});

database.end();
*/
//TODO: check if changing * is optimal in queries


class DatabaseHandler{
    database = null
    constructor(){
        this.database = mysql.createConnection({
            host: '127.0.0.1',
            user: 'root',
            password: 'admin',
            database: 'userData'
          })

          this.database.connect((err,result) => {
            if (err) {
              console.error('Error connecting to the database:', err.stack)
            }
            else{
                console.log(result)
            }
        })
    }

    checkIfUserExists(username){
        return this.database.query('SELECT * FROM UserInformation WHERE username LIKE "' + username + '" ;', (err, results) => {
            if(err){
              console.error(err)
            } 
            else{
              return (results.length != 0)
            }
          })
    }

    getUserInformation(username){
        return this.database.query('SELECT * FROM UserInformation WHERE username LIKE "' + username + '" ;', (err, results) => {
            if (err) {
              console.error(err)
            } else {
              if(results.length != 0){
                return results[0]
              }
              else{
                return []
              }
            }
          })
    }


    //TODO:
    //RETURNS UNDEFINED
    getUserBalance(username){
        this.database.query('SELECT * FROM UserInformation WHERE username LIKE "' + username + '" ;', (err, results) => {
            if (err) {
              console.error(err)
            } else {
              if(results.length != 0){
                return results[0]['balance']
              }
              else{
                return []
              }
            }
          })
    }

    checkPassword(username, password){
        return this.database.query('SELECT * FROM UserInformation WHERE username LIKE "' + username + '" ;', (err, results) => {
            if (err) {
              console.error(err)
            }
            else {
                if(results.length != 0){
                    return argon2.verify(results[0]['password'], password)
                    .then(isVerified => {
                        if (isVerified){
                            console.log('Password is correct!')
                            return true
                        } 
                        else{
                            console.log('Password is incorrect.')
                            return false
                        }
                    })
                    .catch(err => {
                        console.error('Error during verification:', err)
                        throw err
                    })
              }
              else{
                return false
              }
            }
          })
    }

    createUser(username,password){
        const hash = argon2.hash(password).then(hashedPassword => {
            this.database.execute('INSERT INTO UserInformation (username,password) VALUES ("' + username + '","' + hashedPassword + '");', (err,results) => {
                if (err) {
                  console.error(err)
                } else {
                  console.log(results)
                }
              })
        })
    }


    //Add wins,losses,ties and refresh the balance
    updateUserGameInfo(data){
        let temp
        for(let i = 0; i < data.length; i++){
            temp = data[i][1] == 1 ? 'wins' : (data[i][1] == 0) ? 'ties' : 'losses' 
            this.database.execute('UPDATE UserInformation SET ' + temp + ' = ' + temp + ' + 1, balance = ' + data[i][2] + ' WHERE username LIKE "' + data[i][0] + '";', (err,results) => {
                if (err) {
                  console.error(err)
                } else {
                  console.log(results)
                }
              })
        }
    }

    endConnection(){
        database.end()
    }
}

module.exports = DatabaseHandler