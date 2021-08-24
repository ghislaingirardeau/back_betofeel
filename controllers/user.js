const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

/* CONNECTION MYSQL */
const mysql = require('mysql');
const config = require('../config');
const connection = mysql.createConnection(config);

connection.connect(function(err) {
    if (err) {
      return console.error('error: ' + err.message);
    }
console.log('Connected to the MySQL server');
});

const salt = 10

/* signup */

exports.signup = (req, res, next) => {

    const regexEmail = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
    const regexPassword = /^.*(?=.{6,})(?=.*\d)(?=.*[a-zA-Z]).*$/ /* Minimum 6 caracteres dont 1 lettre et une chiffre */

    if (regexEmail.test(req.body.email) === true && regexPassword.test(req.body.password) === true) { /* verifie la saiise des entrées */
        
        bcrypt.hash(req.body.password, salt)
        .then(hash => {

            const sql = `SET @pseudo="${req.body.pseudo}", @email=AES_ENCRYPT('${req.body.email}','clesecrete'), @password="${hash}";`
            connection.query(sql, (error, results, fields) => {
                
                if (error) {
                    res.status(400).json({message: 'erreur de variable'})
                }
                else if(results){
                    
                    /* const sql = `CALL signup(@pseudo, @email, @password)`; */
                    const sql = `INSERT INTO user (pseudo, email, password)
                    VALUES (@pseudo, @email, @password);`; 
                    connection.query(sql, (error, result, fields) => {
                        /* let userSelect = result[0]
                    
                        if (error || userSelect[0].Status === "Error") {
                            res.status(400).json({message: userSelect[0].Response})
                        }
                        else if(result){ 
                            res.status(200).json({
                                pseudo: userSelect[0].pseudo,
                                userId: userSelect[0].id,
                                token: jwt.sign({
                                    userId: userSelect[0].id}, `${process.env.CLE}`,
                                    { expiresIn: '24h'}),
                                role: userSelect[0].roles
                            })
                        } */
                        if (error) {
                            res.status(400).json({message: "pseudo existe deja"})
                            console.log(error)
                        }
                        else if(result){ 
                            const sql = `SELECT pseudo, id, roles FROM user WHERE pseudo=@pseudo AND email=@email;`
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
                                        role: result[0].roles
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

exports.login = (req, res, next) => { 

    const sql = `SET @pseudo="${req.body.pseudo}"`;
    connection.query(sql, (error, results, fields) => {
        if (error) {
            res.status(500).json({message: 'erreur database'})
        }
        else if(results){

            const sql = `SELECT id, pseudo, password, roles FROM user WHERE pseudo=@pseudo`;
            connection.query(sql, (error, results, fields) => {

                if (results.length == 0 || error) { /* Si utilisateur n'existe pas, renvoie un tableau vide */
                    res.status(400).json({message: "Ce pseudo n'existe pas"})
                }
                else if(results.length == 1){ /* Si utilisateur existe, renvoie un tableau avec une seule donnée */
                    bcrypt.compare(req.body.password, results[0].password)
                    .then(valid => {
                        if (!valid){
                        return res.status(400).json({message: "Ce mot de passe n'est pas valide"})
                        }
                        res.status(200).json({
                        pseudo: results[0].pseudo,    
                        userId: results[0].id,
                            token: jwt.sign(
                            {userId: results[0].id}, `${process.env.CLE}`,
                            { expiresIn: '24h'}),
                        role: results[0].roles
                        })
                    })
                    .catch(() => res.status(500).json({message: "erreur login"}))
                }           
            });
        }
    });
}