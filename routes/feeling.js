const express = require('express')
const feeling = require('../controllers/feeling')
const authentification = require('../middlewares/auth')

const router = express.Router()

router.post('/', authentification, feeling.allFeeling) /* {"user_id":"XXX"} */
router.post('/positive', authentification, feeling.createpositive)  /* expect { "user_id":"XXX" ,"feeling": "XXXX"} */
router.post('/negative', authentification, feeling.createnegative)

module.exports = router