  
const jwt = require('jsonwebtoken')

const authentification = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1] 
        const decodedToken = jwt.verify(token, `${process.env.CLE}`)
        const tokenUserId = decodedToken.userId
        if (req.body.user_id && req.body.user_id != tokenUserId) {
            res.status(404).json({error :"Cet Id ne correspond pas !"})
        }
        else {
            next()
        }
    }
    catch (error) {
        res.status(401).json({error :'Requête non authentifié !'})
    }
}

module.exports = authentification