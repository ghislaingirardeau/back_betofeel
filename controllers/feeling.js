/* CONNECTION MYSQL */
const mysql = require('mysql')
const config = require('../config')
const connection = mysql.createConnection(config)


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

