const express = require ("express");
const router = express.Router();


//index -users
router.get("/",(req,res)=>{
    res.send("GET for users");
});

//show -users
router.get("/:id",(req,res)=>{
    res.send("GET for  user id");
});

//POST-users
router.post("/",(req,res)=>{
    res.send("POST for  show users");
});


//DELETE-users
router.delete("/:id",(req,res)=>{
    res.send("DELETE for users id");
});

module.exports = router;