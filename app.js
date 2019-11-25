//jshint esversion:6
const express = require('express');
const bodyParser = require('body-parser');
// const request = require('request');
const date = require(__dirname + "/engine.js");    //module

const app = express();

let state = "all";
const searchedItemsList = [];
const productList = [];

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(bodyParser.json())

app.get("/", function(req,res){
  res.render("search",{searchedItemsList:searchedItemsList});
});

app.post("/", function(req,res){
  const searchedProduct = {
    productName:req.body.productName,
    quantity:req.body.quantity,
    minPrice:req.body.minPrice,
    maxPrice:req.body.maxPrice,
    state:req.body.state
  }
  if(searchedProduct.minPrice<=searchedProduct.maxPrice){
    console.log(searchedProduct.state);
    searchedItemsList.push(searchedProduct);
    res.redirect("/");
  }else{
    res.alert("Cena maksymalna musi być większa od minimalnej!");
  }

});

app.get("/result", function(req,res){
  res.render("result", {newListItems:workItems});
});

app.listen(3000, function(){
  console.log("Server started on port 3000.");
});
