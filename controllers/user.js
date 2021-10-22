const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

/* CONNECTION MYSQL */
const mysql = require('mysql');
const config = require('../config');


function closeDb (connection) {
    connection.end(function(err) {
        if (err) {
          return console.log('error:' + err.message);
        }
        console.log('Close the database connection.');
    });

}

const salt = 10

/* signup */

exports.signup = (req, res, next) => {

    const regexEmail = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
    const regexPassword = /^.*(?=.{6,})(?=.*\d)(?=.*[a-zA-Z]).*$/ /* Minimum 6 caracteres dont 1 lettre et une chiffre */
    const pseudoLowCase = req.body.pseudo.toLowerCase()
    if (regexEmail.test(req.body.email) === true && regexPassword.test(req.body.password) === true) { /* verifie la saiise des entrées */
        
        bcrypt.hash(req.body.password, salt)
        .then(hash => {

            const sql = `SET @pseudo="${pseudoLowCase}", @email=AES_ENCRYPT('${req.body.email}','clesecrete'), @password="${hash}", @avatar="${req.body.avatar}";`
            connection.query(sql, (error, results, fields) => {
                
                if (error) {
                    res.status(400).json({message: 'erreur de variable'})
                }
                else if(results){
                    
                    /* const sql = `CALL signup(@pseudo, @email, @password)`; */
                    const sql = `INSERT INTO user (pseudo, email, password, avatar)
                    VALUES (@pseudo, @email, @password, @avatar);`; 
                    connection.query(sql, (error, result, fields) => {
                        if (error) {
                            res.status(400).json({message: "pseudo existe deja"})
                            console.log(error)
                        }
                        else if(result){ 
                            const sql = `SELECT pseudo, id, roles, avatar FROM user WHERE pseudo=@pseudo AND email=@email;`
                            connection.query(sql, (error, result, fields) => {
                                if (error) {
                                    res.status(400).json({message: "erreur de selection"})
                                }
                                else if(result) {
                                    res.status(200).json({
                                        pseudo: result[0].pseudo,
                                        userId: result[0].id,
                                        token: jwt.sign({
                                            userId: result[0].id}, `${process.env.CLE}`,
                                            { expiresIn: '24h'}),
                                        role: result[0].roles,
                                        avatar: result[0].avatar
                                    })
                                }
                            })
                        } 
                    });
                }
            });
        })
        .catch(() => res.status(400).json({message: 'Echec'}))
    } else {
        res.status(401).json({message: 'Le format de donnée ne correspond pas !'})
    }
}

exports.login = async (req, res, next) => { 

    const connection = await mysql.createConnection(config)
    if(connection) {
        const sql = `SET @pseudo="${req.body.pseudo}"`
        connection.query(sql, (error, results, fields) => {
            if (error) {
                res.status(500).json({message: 'erreur database'})
                closeDb(connection)
    
            }
            else if(results){
    
                const sql = `SELECT id, pseudo, password, roles, avatar FROM user WHERE pseudo=@pseudo`;
                
                connection.query(sql, (error, results, fields) => {
                    
                    if (results.length == 0 || error) { /* Si utilisateur n'existe pas, renvoie un tableau vide */
                        res.status(400).json({message: "Ce pseudo n'existe pas"})
                        closeDb(connection)
                    }
                    else if(results.length == 1){ /* Si utilisateur existe, renvoie un tableau avec une seule donnée */
                        bcrypt.compare(req.body.password, results[0].password)
                        .then(valid => {
                            if (!valid){
                                return res.status(400).json({message: "Ce mot de passe n'est pas valide"})
                                closeDb(connection)
                            }
                            res.status(200).json({
                            pseudo: results[0].pseudo,    
                            userId: results[0].id,
                                token: jwt.sign(
                                {userId: results[0].id}, `${process.env.CLE}`,
                                { expiresIn: '24h'}),
                            role: results[0].roles,
                            avatar: results[0].avatar
                            })
                            closeDb(connection)
                        })
                        .catch(() => res.status(500).json({message: "erreur login"}))
                    }           
                });
            }
        });
    }
}

exports.test = async (req, res, next) => {
    
    const connection = await mysql.createConnection(config)
    if(connection) {
        const sql = `SELECT pseudo from user;`
        const response = await connection.query(sql, (error, results, fields) => {
            if (error) {
                res.status(500).json({message: 'erreur database'})
            } else if(results) {
                res.send(results)
            }
        })
        if(response) {
            closeDb(connection)        
        }
    }
    
}