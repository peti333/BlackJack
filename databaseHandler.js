const mysql = require('mysql2')
const argon2 = require('argon2')


const options = {
    type: argon2.argon2id,
    timeCost: 1,
    memoryCost: 65536,
    parallelism: 4,
    hash_len: 99, //MIGHT CHANGE LATER
}



//TODO: check if changing * is optimal in queries
//TODO: may need to switch to async functions and promises due to how mysql works

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
      return new Promise((resolve,reject) => {
        return this.database.query('SELECT * FROM UserInformation WHERE username LIKE "' + username + '" ;', (err, results) => {
            if(err){
              console.error(err)
              reject(err)
            } 
            else{
              resolve(results.length != 0)
            }
          })
      })
    }

    getUserInformation(username){
      return new Promise((resolve,reject) => {
        return this.database.query('SELECT * FROM UserInformation WHERE username LIKE "' + username + '";', (err, results) => {
            if (err) {
              console.error(err)
              reject(err)
            } else {
              if(results.length != 0){
                resolve(results)
              }
              else{
                resolve([])
              }
            }
          })
      })
    }


    getUserBalance(username){
      return new Promise((resolve,reject) => {
        return this.database.query('SELECT * FROM UserInformation WHERE username LIKE "' + username + '";', (err, results) => {
            if (err) {
              console.error(err)
              reject(err)
            } 
            else{
              if(results.length != 0){
                resolve(results[0]['balance'])
              }
              else{
                resolve(0)
              }
            }
          })
      })
    }

    checkPassword(username, password){
        return this.database.query('SELECT * FROM UserInformation WHERE username LIKE "' + username + '";', (err, results) => {
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
      console.log("Creating user: " + username + ", " + password)
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
      console.log("updating user info: " + data)
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

    getAllUsernames(){
      return new Promise((resolve,reject) => {
        return this.database.query('SELECT username FROM UserInformation;', (err, results) => {
            if (err) {
              console.error(err)
              reject(err)
            } 
            else{
              if(results.length != 0){
                resolve(results)
              }
              else{
                resolve(0)
              }
            }
          })
      })
    }

    deleteUser(username){
      return new Promise((resolve,reject) => {
        return this.database.execute('DELETE FROM UserInformation WHERE username LIKE "' + username + '";', (err, results) => {
            if (err) {
              console.error(err)
              reject(err)
            } 
            else{
              if(results.length != 0){
                console.log(results)
                resolve(username)
              }
              else{
                resolve(0)
              }
            }
          })
      })
    }

    getUserSignUpMonths(){
      return new Promise((resolve,reject) => {
        return this.database.query("SELECT DATE_FORMAT(joined, '%Y-%m') AS join_month, COUNT(*) AS user_count FROM UserInformation GROUP BY join_month ORDER BY join_month;", (err, results) => {
            if (err) {
              console.error(err)
              reject(err)
            } 
            else{
              if(results.length != 0){
                resolve(results)
              }
              else{
                resolve(0)
              }
            }
          })
      })
    }

    endConnection(){
        database.end()
    }
}

module.exports = DatabaseHandler