//jshint esversion:6
const request = require('request');
var superagent = require('superagent');

const links = [];
let phraseStart = "https://api.allegro.pl/offers/listing?phrase=";
// let phraseEnd =  "&sellingMode.format=BUY_NOW&searchMode=REGULAR&sort=+withDeliveryPrice&limit=50";
let phraseEnd =  "&sellingMode.format=BUY_NOW";

//Otrzymujemy access_token do autoryzacji
//async sprawia, ze fukcja czeka na wykonanie getToken()
//wartosc accessToken zwracany jest w then() w app.js
exports.getAccessToken = async function(){
	var authUrl = "https://allegro.pl/auth/oauth/token?grant_type=client_credentials";
  // var clientId = "9ba1e6fc865c46379cb6afc1fa548b13";
  // var clientSecret = "2LRgv5M3FISr783Io0n9FbuQdk57GS19HGQV4TJMpbfahsE7OjwOpnvy1lG5W0V7";
  // "clientId:clientSecret" zakodowane w formacie base64:
  var clientAuth = "Basic OWJhMWU2ZmM4NjVjNDYzNzljYjZhZmMxZmE1NDhiMTM6MkxSZ3Y1TTNGSVNyNzgzSW8wbjlGYnVRZGs1N0dTMTlIR1FWNFRKTXBiZmFoc0U3T2p3T3BudnkxbEc1VzBWNw==";
  var accessToken;
  var options = {
    url: authUrl,
    method: "POST",
    headers: {
      "Authorization": clientAuth
    }
  };

//funkcja generujaca token, ktory jest promise
//musielismy to napisac w ten sposob, bo wystepowal problem opisany w linku nizej
//https://stackoverflow.com/questions/14220321/how-do-i-return-the-response-from-an-asynchronous-call
  function getToken(){	
    return new Promise(resolve => {
      request(options, function(error, response, body){
        if(error){
          console.log(error);
        }else{
          if(response.statusCode === 200){
            accessToken = JSON.parse(response.body).access_token;
            // console.log("1 " + accessToken);
            resolve(accessToken);
          }else{
            console.log(response);
          }
        }
      });
    });
  }

  var accessToken = await getToken();

  return accessToken;

}



//zwraca linki ofert
exports.getLinks = function(searchedProductsList){
  for(let i = 0; i < searchedProductsList.length; i++){
    if(searchedProductsList[i].minPrice>searchedProductsList[i].maxPrice){
      searchedProductsList[i].maxPrice=searchedProductsList[i].minPrice;
    }
    links.push(
      phraseStart + searchedProductsList[i].productName.trim().split(' ').join('+') +
      "&price.from=" + searchedProductsList[i].minPrice +
      "&price.to=" + searchedProductsList[i].maxPrice +
      phraseEnd
      );
  }
  return links;
}
exports.getL = function(){return links;}

//zamienia linki na liste ofert
exports.getOffersListing = function(links, token){
  var lista;
  var options = {
    url: links,
    method: "GET",
    headers: {
      "Accept": "application/vnd.allegro.public.v1+json",
      "content-type": "application/vnd.allegro.public.v1+json",
      "Authorization": "Bearer " + token
    },
    // sort:"+withDeliveryPrice",
    // limit: "20",
    // sellingMode:{
    //   format:"BUY_NOW"
    // }
  };

//wykonanie zamiany jest tutaj
  function getOneOfferListing(){
    request(options, function(error, response, body){
      if(error){
        console.log("Error " + error);
      }else{
        if(response.statusCode === 200){
          lista = JSON.parse(response.body);
          console.log("Lista: " + lista);
          return lista;
        }else{
          console.log(response);
        }
      }
    });
  }

  lista = getOneOfferListing();

  return lista;
}
