const express = require("express");
const controller = require("../controllers");
const router = express.Router();


// endpoints
router.get("/", (req, res) => {
    res.send("Hello World");
});

router.post("/add-team", controller.addTeam);
router.get("/process-result", controller.processResults);
router.get("/team-result", controller.teamResult);

module.exports = router;
