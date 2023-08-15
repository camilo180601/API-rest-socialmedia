const express = require('express');
const router = express.Router();
const Check = require('../middlewares/auth');
const UserController = require('../controllers/user');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/avatars/")
    },
    filename: (req, file, cb) => {
        cb(null, "avatar-" + Date.now() +"-"+file.originalname)
    }
});

const uploads = multer({storage});

router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.get("/profile/:id", Check.auth, UserController.profile);
router.get("/list/:page?", Check.auth, UserController.list);
router.put("/update", Check.auth, UserController.update);
router.post("/upload", [Check.auth, uploads.single("image")], UserController.upload);
router.get("/avatar/:file", UserController.avatar);
router.get("/counters/:id?", Check.auth, UserController.counters);

module.exports = router;