//jshint esversion:6
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const engine = require(__dirname + "/engine.js");    //module

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(bodyParser.json());

const inputProductsList = [{
  productName: "Iphone X",
  minPrice: 2000,
  maxPrice: 7000,
  state: "Nowy"
}];
var linksList = [];
const allProductsList = [];
var accessToken;

//miejsce then opisane w 12 linijce engine.js
engine.getAccessToken().then(function(res){accessToken=res;});


app.get("/", async function(req,res){

  res.render("search",{searchedItemsList:inputProductsList});
  // console.log(accessToken);

});

app.post("/", function(req,res){
  const searchedProduct = {
    productName:req.body.productName,
    minPrice:req.body.minPrice,
    maxPrice:req.body.maxPrice,
    state:req.body.state
  }

  inputProductsList.push(searchedProduct);
  res.redirect("/");

});


app.get("/result", async function(req,res){
  linksList = await engine.getLinks(inputProductsList);
  console.log(linksList);

  for(let i = 0; i<linksList.length; i++){
    var lista;
    lista = await engine.getOffersListing(linksList, accessToken, i);
    // await engine.findOnlyThree();
    console.log(lista);
    allProductsList.push(lista);
  }
  // console.log(allProductsList[0][0]);



  res.sendFile(__dirname + "/views/results.html");
  // res.render("result", {newListItems:workItems});
});

app.listen(3000, function(){
  console.log("Server started on port 3000...........................................................................................................................");
});
