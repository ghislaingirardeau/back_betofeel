const express = require('express')
const share = require('../controllers/share')
const authentification = require('../middlewares/auth')

const router = express.Router()

router.post('/searchUser', authentification, share.searchUser) /* {searchPseudo: this.searchPseudo, user_id: user_id} */
router.put('/responseSharing', authentification, share.responseSharing) /* {responseStatus: res, user_id: user_id, idFrom: idFrom} */
router.put('/remove', /* authentification,  */share.deleteSharing) /* {user_id: user_id, connectTo: user.connectTo} */
router.post('/feelingUser', share.feelingUser) /* {user_id: this.user_id} */

module.exports = router