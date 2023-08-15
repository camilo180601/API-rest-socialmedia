const express = require('express');
const router = express.Router();
const Check = require('../middlewares/auth');
const FollowController = require('../controllers/follow');

router.post('/save', Check.auth, FollowController.save);
router.delete('/unfollow/:id', Check.auth, FollowController.unfollow);
router.get("/following/:id?/:page?", Check.auth, FollowController.following);
router.get("/followers/:id?/:page?", Check.auth, FollowController.followers);

module.exports = router;
