/* CONNECTION MYSQL */
const mysql = require('mysql')
const config = require('../config')
const connection = mysql.createConnection(config)


exports.allFeeling = (req, res, next) => { 

    const sql = `select feeling_pos AS feel, date, pseudo, user_id from positive INNER JOIN user ON positive.user_id=user.id where user_id=${req.body.user_id}
    UNION select feeling_neg AS feel, date, pseudo, user_id from negative INNER JOIN user ON negative.user_id=user.id where user_id=${req.body.user_id};`
    /* const sql = `CALL user_feeling("${req.body.user_id}")` */
    connection.query(sql, (error, results, fields) => {

        if (error) {
            res.status(400).json({message: "echec"})
        } else if (results) {
            res.status(200).json({
                results
                /* positive: results[0],
                totalPositif: results[0].length,
                negative: results[1],
                totalNegatif: results[1].length, */
            })
        }
    })
}

exports.sharedFeeling = (req, res, next) => {
     
    const sql = `call user_share(${req.body.user_id})`
    connection.query(sql, (error, results, fields) => {

        if (error) {
            res.status(400).json({message: "echec"})
        } else if (results) {
            res.status(200).json({
                positive: results[0],
                negative: results[1]
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

exports.modifyFeeling = (req, res, next) => { 
    
    const sql = `XXX`
    connection.query(sql, (error, results, fields) => {

        if (error) {
            res.status(400).json({})
        } else if (results) {
            res.status(200).json({})
        }
    })
}

exports.removeFeeling = (req, res, next) => { 
    
    const sql = `XXX`
    connection.query(sql, (error, results, fields) => {

        if (error) {
            res.status(400).json({})
        } else if (results) {
            res.status(200).json({})
        }
    })
}

