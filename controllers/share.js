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

exports.searchUser = (req, res, next) => {
    handleDisconnect();
    const sql = `select id from user where pseudo='${req.body.searchPseudo}'`
    connection.query(sql, (error, results, fields) => {
 
        if (error) {
            res.status(400).json({message: "erreur de recherche"})
        } else if (results.length === 0) { /* si requete ne renvoie aucun pseudo alors renvoie un tableau vide */
             res.status(200).json({message: "undefined"})
        } else if (results.length > 0) { /* si j'ai un resultat et donc le pseudo existe */
             const idFind = results[0].id
             const sql = `INSERT INTO sharing (connectFrom, status, connectTo) VALUES (${req.body.user_id}, 'on demand', ${idFind})`
             connection.query(sql, (error, result, fields) => {
                 if (error) {
                     res.status(400).json({message: "erreur insertion"})
                 } else if (result) {
                     res.status(200).json({
                         message: "demande de partage envoyé",
                         idFind: idFind
                        })
                 }
             })
        }
    })
}

exports.responseSharing = (req, res, next) => {
    handleDisconnect();
    const sql = `update sharing set status='${req.body.responseStatus}' where connectFrom='${req.body.idFrom}' 
    AND connectTo='${req.body.user_id}'`
    connection.query(sql, (error, results, fields) => {
        if (error) {
            res.status(400).json({message: "erreur envoie de réponse"})
        } else if (results) {
            if(req.body.responseStatus === "authorized"){ /* si la réponse du front est autorisé */
                const sql = `INSERT INTO sharing (connectFrom, status, connectTo) VALUES (${req.body.user_id}, 'authorized', ${req.body.idFrom})`
                connection.query(sql, (error, results, fields) => {
                    if (error) {
                        res.status(400).json({message: "Erreur invitation reverse"})
                    } else if (results) {
                        res.status(200).json({message: "update et insertion de connexion ok"})
                    }
                })

            } else { /* si la reponse du front est rejeté */
                res.status(200).json({message: "Rejet de l'invitation"})
            }
        }
    })
}

exports.feelingUser = (req, res, next) => { 
    /* renvoie 3 tableaux: un avec toutes les emotions
    un avec tous les utilisateurs partagé ou rejeté
    un avec toutes les demandes de partage en cours */
    handleDisconnect();
    const sql = `CALL user_share("${req.body.user_id}")`
    connection.query(sql, (error, results, fields) => {
        if (error) {
            res.status(400).json({message: "echec load data usershared"})
            console.log(error)
        } else if (results) {
            res.status(200).json({
                results                
            })
        }
    })
}

exports.deleteSharing = (req, res, next) => { 
    handleDisconnect();
    const sql = `SET @connectTo="${req.body.connectTo}", @user_id='${req.body.user_id}'`
    connection.query(sql, (error, results, fields) => {

        if (error) {
            res.status(400).json({message: "erreur data"})
        } else if (results) {
            const sql = `CALL remove_sharing(@user_id, @connectTo)`  
            connection.query(sql, (error, results, fields) => {

                if (error) {
                    res.status(400).json({message: "erreur suppression de user sharing"})
                } else if (results) {
                    res.status(200).json({message: "Vous ne suivez plus cette personne"})       
                }
            })      
        }
    })
}