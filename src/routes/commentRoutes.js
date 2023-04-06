const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");

router.get("/", commentController.getComments);
router.post("/", commentController.createCommentAndToken);

router.patch("/updateComment/:userNameOrEmail/:eventName", commentController.updateCommentAndToken);
router.delete("/deleteComment/:userNameOrEmail/:eventName", commentController.deleteCommentAndToken);

module.exports = router;