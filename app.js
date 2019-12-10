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

var chosenRating = 4.92;
const inputProductsList = [{
  productName: "Iphone X",
  minPrice: 2000,
  maxPrice: 7000,
  state: "Nowe"
},{
  productName: "Iphone XS",
  minPrice: 1000,
  maxPrice: 7000,
  state: "Nowe"
}];

//Do testowania
// var shoppingCart = [
//  {
//     sum: 1900,
//     deliveryPrice: 20,
//     product:[{name:"Samsung Galaxy S10 Master Race", price: 1600, seller:"Samsung", link:""},
//             {name:"Usłyszysz nawet ciszę", price: 200, seller:"Samsung", link:""},
//             {name:"Nie zepsuj kabla!", price: 80, seller:"Samsung", link:""}]
//   },
//   {
//     sum: 1950,
//     deliveryPrice: 50,
//     product:[{name:"Na co Ci iphone? Huaweii ftw", price: 1600, seller:"Huaweii", link:""},
//             {name:"takich słuchawek jeszcze nie widziałeś!", price: 200, seller:"Huaweii", link:""},
//             {name:"Podładuj do 100% z nową ładowarką", price: 100, seller:"Huaweii", link:""}]
//   },
//   {
//     sum: 1950,
//     deliveryPrice: 50,
//     product:[{name:"Na co Ci iphone? Huaweii ftw", price: 1600, seller:"Huaweii", link:""},
//             {name:"takich słuchawek jeszcze nie widziałeś!", price: 200, seller:"Huaweii", link:""},
//             {name:"Podładuj do 100% z nową ładowarką", price: 100, seller:"Huaweii", link:""}]
//   }
// ];
var linksList = [];
const allProductsList = [];
var accessToken;
var set1, set2, set3 = {product:[]};
var theCheapest = {product:[]};


//miejsce then opisane w 12 linijce engine.js
engine.getAccessToken().then(function(res){accessToken=res;});


app.get("/", async function(req,res){
  res.render("search",{searchedItemsList:inputProductsList});
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
  //Pobieranie wszystkich potrzebnych produktów
  for(let i = 0; i<linksList.length; i++){
    var lista;
    lista = await engine.getOffersListing(linksList, accessToken, i);

    allProductsList.push(lista);
  }


//Wydzielanie możliwych wyjątków od najtańszych zestawów ze względu niwelacje ceny dostawy
  //Tworzenie
  var duplicatedSellersWithRating = [];
  var duplicatedSellers = engine.getDuplicatedSeller(allProductsList);
  var iterator = duplicatedSellers.values();
  for(let i = 0; i < duplicatedSellers.size; i++){
    let idFromSet = iterator.next().value;
    let rating = await engine.getSellerRating(idFromSet, accessToken);
    if (rating>chosenRating){
      // duplicatedSellersWithRating.push({sellerID: idFromSet, rating: rating, products:[]});
      duplicatedSellersWithRating.push({sellerID: idFromSet, rating: rating});
    }
  }

  set1 = engine.getBestOption(allProductsList, duplicatedSellersWithRating);
  // for(let i = 0; i < allProductsList.length; i++){
  //   allProductsList[i].splice(set1.product[i].id)
  // }
  set2 = engine.getBestOption(allProductsList, duplicatedSellersWithRating);
  set3 = engine.getBestOption(allProductsList, duplicatedSellersWithRating);

  console.log(set3);
  var shoppingCart = [ set1, set2, set3];
  // res.sendFile(__dirname + "/views/results.html");
  res.render("result", {inputItemList: inputProductsList, cart:shoppingCart});
});

app.listen(3000, function(){
  console.log("Server started on port 3000...........................................................................................................................");
});
