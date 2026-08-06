const express = require ("express");
const router = express.Router();



//posts
//index 
router.get("/",(req,res)=>{
    res.send("GET for posts");
});

//show
router.get("/:id",(req,res)=>{
    res.send("GET for  show posts");
});

//POST
router.post("/",(req,res)=>{
    res.send("POST for  show posts");
});


//DELETE
router.delete("/:id",(req,res)=>{
    res.send("DELETE for posts id");
});

module.exports = router;