const express = require('express');
const router = express.Router();
const Check = require('../middlewares/auth');
const LikeController = require('../controllers/like');

router.post("/save", Check.auth, LikeController.save);
router.delete("/remove/:id", Check.auth, LikeController.remove);
router.get("/list/:id/:page?", Check.auth, LikeController.list);
router.get("/counter/:id", Check.auth, LikeController.counter);

module.exports = router;