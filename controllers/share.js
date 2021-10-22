/* CONNECTION MYSQL */
const mysql = require('mysql')
const config = require('../config')

function closeDb (connection) {
    connection.end(function(err) {
        if (err) {
          return console.log('error:' + err.message);
        }
        console.log('Close the database connection.');
    });
}

exports.searchUser = async (req, res, next) => {

    const connection = await mysql.createConnection(config)
    if(connection) {
        const sql = `select id from user where pseudo='${req.body.searchPseudo}'`
        connection.query(sql, (error, results, fields) => {
     
            if (error) {
                res.status(400).json({message: "erreur de recherche"})
                closeDb(connection)
            } else if (results.length === 0) { /* si requete ne renvoie aucun pseudo alors renvoie un tableau vide */
                 res.status(200).json({message: "undefined"})
                 closeDb(connection)
            } else if (results.length > 0) { /* si j'ai un resultat et donc le pseudo existe */
                 const idFind = results[0].id
                 const sql = `INSERT INTO sharing (connectFrom, status, connectTo) VALUES (${req.body.user_id}, 'on demand', ${idFind})`
                 connection.query(sql, (error, result, fields) => {
                     if (error) {
                         res.status(400).json({message: "erreur insertion"})
                         closeDb(connection)
                     } else if (result) {
                        res.status(200).json({
                             message: "demande de partage envoyé",
                             idFind: idFind
                        })
                        closeDb(connection)
                     }
                 })
            }
        })
    }
}

exports.responseSharing = async (req, res, next) => {

    const connection = await mysql.createConnection(config)
    if(connection) {
        const sql = `update sharing set status='${req.body.responseStatus}' where connectFrom='${req.body.idFrom}' 
        AND connectTo='${req.body.user_id}'`
        connection.query(sql, (error, results, fields) => {
            if (error) {
                res.status(400).json({message: "erreur envoie de réponse"})
                closeDb(connection)
            } else if (results) {
                if(req.body.responseStatus === "authorized"){ /* si la réponse du front est autorisé */
                    const sql = `INSERT INTO sharing (connectFrom, status, connectTo) VALUES (${req.body.user_id}, 'authorized', ${req.body.idFrom})`
                    connection.query(sql, (error, results, fields) => {
                        if (error) {
                            res.status(400).json({message: "Erreur invitation reverse"})
                            closeDb(connection)
                        } else if (results) {
                            res.status(200).json({message: "update et insertion de connexion ok"})
                            closeDb(connection)
                        }
                    })
    
                } else { /* si la reponse du front est rejeté */
                    res.status(200).json({message: "Rejet de l'invitation"})
                    closeDb(connection)
                }
            }
        })
    }

}

exports.feelingUser = async (req, res, next) => { 

    const connection = await mysql.createConnection(config)
    if(connection) {
        const sql = `CALL user_share("${req.body.user_id}")`
        connection.query(sql, (error, results, fields) => {
            if (error) {
                res.status(400).json({message: "echec load data usershared"})
                closeDb(connection)
            } else if (results) {
                res.status(200).json({
                    results                
                })
                closeDb(connection)
            }
        })
    }
    /* renvoie 3 tableaux: un avec toutes les emotions
    un avec tous les utilisateurs partagé ou rejeté
    un avec toutes les demandes de partage en cours */
    
}

exports.deleteSharing = async (req, res, next) => { 

    const connection = await mysql.createConnection(config)
    if(connection) {
        const sql = `SET @connectTo="${req.body.connectTo}", @user_id='${req.body.user_id}'`
        connection.query(sql, (error, results, fields) => {
    
            if (error) {
                res.status(400).json({message: "erreur data"})
                closeDb(connection)
            } else if (results) {
                const sql = `CALL remove_sharing(@user_id, @connectTo)`  
                connection.query(sql, (error, results, fields) => {
    
                    if (error) {
                        res.status(400).json({message: "erreur suppression de user sharing"})
                        closeDb(connection)
                    } else if (results) {
                        res.status(200).json({message: "Vous ne suivez plus cette personne"}) 
                        closeDb(connection)      
                    }
                })      
            }
        })
    }
}