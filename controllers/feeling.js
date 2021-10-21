/* CONNECTION MYSQL */
const mysql = require('mysql')
const config = require('../config')

// DETAIL SUR CONTROLLER USER
var connection;

function handleDisconnect() {
  connection = mysql.createConnection(config); // Recreate the connection, since
                                                  // the old one cannot be reused.

  connection.connect(function(err) {              // The server is either down
    if(err) {                                     // or restarting (takes a while sometimes).
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
    }
    console.log('Connected to the MySQL server');                                    
  });                                     // process asynchronous requests in the meantime.
                                          // If you're also serving http, display a 503 error.
  connection.on('error', function(err) {
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
      handleDisconnect();                         // lost due to either server restart, or a
    } else {                                      // connnection idle timeout (the wait_timeout
      throw err;                                  // server variable configures this)
    }
  });
}
handleDisconnect();

exports.allFeeling = (req, res, next) => { 
    /* renvoie 3 tableaux: un avec toutes les emotions
    un avec tous les utilisateurs partagé ou rejeté
    un avec toutes les demandes de partage en cours */
    
    const sql = `CALL user_connect("${req.body.user_id}")`
    connection.query(sql, (error, results, fields) => {

        if (error) {
            res.status(400).json({message: "echec get data de user"})
        } else if (results) {
            res.status(200).json({
                results                
            })
        }
    })
}

exports.createnegative = (req, res, next) => { 
    /* const sql = `CALL add_negative("${req.body.user_id}", "${req.body.feeling}")` */
    const sql = `INSERT INTO negative (feeling_neg, date, user_id)
    VALUES ("${req.body.feeling}", (SELECT NOW()), "${req.body.user_id}");`
    connection.query(sql, (error, results, fields) => {

        if (error) {
            res.status(400).json({message: 'echec de creation'})
        } else if (results) {
            res.status(200).json({message: 'Impression envoyé'})
        }
    })
}

exports.createpositive = (req, res, next) => { 
    /* const sql = `CALL add_positive("${req.body.user_id}", "${req.body.feeling}")` */
    const sql = `INSERT INTO positive (feeling_pos, date, user_id)
    VALUES ("${req.body.feeling}", (SELECT NOW()), "${req.body.user_id}");`
    connection.query(sql, (error, results, fields) => {

        if (error) {
            res.status(400).json({message: 'echec de creation'})
        } else if (results) {
            res.status(200).json({message: 'Impression envoyé'})
        }
    })
}

