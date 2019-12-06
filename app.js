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

let state = "all";
const searchedItemsList = [];
var accessToken;
//miejsce then opisane w 12 linijce engine.js
engine.getAccessToken().then(function(res){accessToken=res;});

var exampleLinks = ['https://api.allegro.pl/offers/listing?phrase=Samochod',
  'https://api.allegro.pl/offers/listing?phrase=Krzeslo&price.from=22&price.to=555&sellingMode.format=BUY_NOW&searchMode=REGULAR&sort=+withDeliveryPrice&limit=10&parameter.11323=11323_2',
  'https://api.allegro.pl/offers/listing?phrase=Czerwona+sukienka&price.from=22&price.to=555&sort=+withDeliveryPrice&sellingMode.format=BUY_NOW&limit=50&searchMode=REGULAR',
  'https://api.allegro.pl/offers/listing?phrase=Krzeslo&price.from=22&price.to=555&sellingMode.format=BUY_NOW&searchMode=REGULAR&sort=+withDeliveryPrice&limit=50',
  'https://api.allegro.pl/offers/listing?phrase=Aparat&price.from=1&price.to=56&sellingMode.format=BUY_NOW&searchMode=REGULAR&sort=+withDeliveryPrice&limit=50',
  'https://api.allegro.pl/offers/listing?phrase=Laptop&price.from=1&price.to=66&sellingMode.format=BUY_NOW&searchMode=REGULAR&sort=+withDeliveryPrice&limit=50',
  'https://api.allegro.pl/offers/listing?phrase=Kamera&price.from=13&price.to=56&sellingMode.format=BUY_NOW&searchMode=REGULAR&sort=+withDeliveryPrice&limit=50' ];

app.get("/", function(req,res){
  res.render("search",{searchedItemsList:searchedItemsList});
  // console.log(accessToken);
  engine.getOffersListing(exampleLinks, accessToken);


});

app.post("/", function(req,res){
  const searchedProduct = {
    productName:req.body.productName,
    minPrice:req.body.minPrice,
    maxPrice:req.body.maxPrice,
    state:req.body.state
  }

  searchedItemsList.push(searchedProduct);
  res.redirect("/");

});

app.get("/result", function(req,res){
  console.log(searchedItemsList);
  console.log(engine.getLinks(searchedItemsList));
  console.log(engine.getL());
  res.sendFile(__dirname + "/views/results.html");
  // res.render("result", {newListItems:workItems});
});

app.listen(3000, function(){
  console.log("Server started on port 3000...........................................................................................................................");
});
