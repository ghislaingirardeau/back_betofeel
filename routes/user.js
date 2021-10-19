const express = require('express')
const userControle = require('../controllers/user')
const router = express.Router()

router.post('/signup', userControle.signup) /* REQUETE ATTENDU { "pseudo": "XXX", "email":"XXX" , "password": "XXX", , "avatar": "XXX"}  */
router.post('/login', userControle.login) /* REQUETE ATTENDU   { "pseudo": "XXX", "password": "XXX"}  */

module.exports = router