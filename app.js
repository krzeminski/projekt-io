//jshint esversion:6
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const engine = require(__dirname + "/engine.js");

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(bodyParser.json());

//przykład do testowania
const startingList = [{
  productName: "Iphone X",
  minPrice: 2000,
  maxPrice: 7000,
  state: "Nowe"
},{
  productName: "Iphone XS",
  minPrice: 1000,
  maxPrice: 7000,
  state: "Nowe"
}, {
    productName: "Iphone 7",
    minPrice: 1000,
    maxPrice: 7000,
    state: "Używane"
}, {
    productName: "Iphone 8",
    minPrice: 1000,
    maxPrice: 7000,
    state: "Używane"
}];

let inputProductsList = [];
// inputProductsList = startingList.slice();      //odkomentować podczas testu
const LIMIT_OF_PRODUCTS = 5;
var linksList = [];
const allProductsList = [];
var accessToken;
var set1, set2, set3 = {product:[]};
var theCheapest = {product:[]};


//Wywołanie pobierania tokenu dostępu
engine.getAccessToken().then(function(res){accessToken=res;});

//wywołanie strony głównej
app.get("/", async function(req,res){
  res.render("search",{searchedItemsList:inputProductsList});
});

//dodawanie przedmiotów do listy
app.post("/", function(req,res){
  const searchedProduct = {
    productName:req.body.productName,
    minPrice:req.body.minPrice,
    maxPrice:req.body.maxPrice,
    state:req.body.state,
    reputation:req.body.reputation
  }
  if(inputProductsList.length < LIMIT_OF_PRODUCTS){
    inputProductsList.push(searchedProduct);
  }else{
    console.log("Za dużo produktów");
  }
  res.redirect("/");

});

//Wysłanie zapytania
app.get("/result", async function(req,res){
  //Tworzenie linków
  linksList = await engine.getLinks(inputProductsList);

  //Pobieranie wszystkich potrzebnych produktów
  for(let i = 0; i<linksList.length; i++){
    var lista;
    lista = await engine.getOffersListing(linksList, accessToken, i);
    //sprawdzanie reputacji sprzedawców
    lista.forEach(async function(element){
      let rating = await engine.getSellerRating(element.seller, accessToken);
      if(rating < inputProductsList[i].reputation){
        let idx = lista.indexOf(element);
        lista.splice(idx,1);
      }
    })
    allProductsList.push(lista);
  }

  //Pobieranie listy sprzedawców, którzy publikują więcej niż jedną ofertę
  var duplicatedSellers = engine.getDuplicatedSeller(allProductsList);

  //Tworzenie zestawień
  set1 = engine.getBestOption(allProductsList, duplicatedSellers);

  for(let i = 0; i < allProductsList.length; i++){
    let idx = allProductsList[i].findIndex(function(element) {
      if(element.id == set1.product[i].id){
        return element;
      }
    });
    allProductsList[i].splice(idx,1);
  }


  set2 = engine.getBestOption(allProductsList, duplicatedSellers);

  for(let i = 0; i < allProductsList.length; i++){
    let idx = allProductsList[i].findIndex(function(element) {
      if(element.id == set2.product[i].id){
        return element;
      }
    });
    allProductsList[i].splice(idx,1);
  }

  set3 = engine.getBestOption(allProductsList, duplicatedSellers);

  //Wysyłanie zestawień do wyświetleń
  var shoppingCart = [ set1, set2, set3];
  res.render("result", {inputItemList: inputProductsList, cart:shoppingCart});

});

app.listen(3000, function(){
  console.log("Server started on port 3000...........................................................................................................................");
});










// var duplicatedSellersWithRating = [];
// var iterator = duplicatedSellers.values();
// for(let i = 0; i < duplicatedSellers.size; i++){
//   let idFromSet = iterator.next().value;
//   let rating = await engine.getSellerRating(idFromSet, accessToken);
//   if (rating>chosenRating){
//     // duplicatedSellersWithRating.push({sellerID: idFromSet, rating: rating, products:[]});
//     duplicatedSellersWithRating.push({sellerID: idFromSet, rating: rating});
//   }
// }
