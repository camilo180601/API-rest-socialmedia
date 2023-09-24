const express = require('express');
const router = express.Router();
const Check = require('../middlewares/auth');
const PublicationController = require('../controllers/publication');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/publications/")
    },
    filename: (req, file, cb) => {
        cb(null, "pub-" + Date.now() +"-"+file.originalname)
    }
});

const uploads = multer({storage});

router.post("/save/:id?", Check.auth, PublicationController.save);
router.get("/detail/:id", Check.auth, PublicationController.detail);
router.delete("/remove/:id", Check.auth, PublicationController.remove);
router.get("/user/:id/:page?", Check.auth, PublicationController.user);
router.post("/upload/:id", [Check.auth, uploads.single("file")], PublicationController.upload);
router.get("/media/:file", PublicationController.media);
router.get("/feed/:page?", Check.auth, PublicationController.feed);

module.exports = router;