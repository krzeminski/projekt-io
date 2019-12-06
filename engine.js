//jshint esversion:6
const request = require('request');
var superagent = require('superagent');
var latinize = require('latinize');

const links = [];
let phraseStart = "https://api.allegro.pl/offers/listing?phrase=";
let phraseEnd =  "&sellingMode.format=BUY_NOW&searchMode=REGULAR&sort=+withDeliveryPrice&limit=50";

//Otrzymujemy access_token do autoryzacji
exports.getAccessToken = async function(){
	var authUrl = "https://allegro.pl/auth/oauth/token?grant_type=client_credentials";
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

  function getToken(){
    return new Promise(resolve => {
      request(options, function(error, response, body){
        if(error){
          console.log(error);
        }else{
          if(response.statusCode === 200){
            accessToken = JSON.parse(response.body).access_token;
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




exports.getLinks = function(searchedProductsList){
	var stateFilter;
  for(let i = 0; i < searchedProductsList.length; i++){
    if(searchedProductsList[i].minPrice>searchedProductsList[i].maxPrice){
      searchedProductsList[i].maxPrice=searchedProductsList[i].minPrice;
    }
		if(searchedProductsList.state == "Nowe"){
			stateFilter="&11323=1";
		}else if (searchedProductsList.state == "Używane") {
			stateFilter="&11323=2";
		}else{
			stateFilter="";
		}
    links.push(
      phraseStart + latinize(searchedProductsList[i].productName).trim().split(' ').join('+') +
      "&price.from=" + searchedProductsList[i].minPrice +
      "&price.to=" + searchedProductsList[i].maxPrice +
      phraseEnd + stateFilter
      );
  }
  return links;
}

exports.getL = function(){return links;}


exports.getOffersListing = async function(links, token){
  var singleProductList;
  var allProductsList;

  var options = {
    url: links,
    method: "GET",
    headers: {
      "Accept": "application/vnd.allegro.public.v1+json",
      "content-type": "application/vnd.allegro.public.v1+json",
      "Authorization": "Bearer " + token
    }
  };

  function getOneOfferListing(number){
		return new Promise(resolve => {
			options.url = links[number];
	    request(options, function(error, response, body){
	      if(error){
	        console.log(error);
	      }else{
	        if(response.statusCode === 200){
	          singleProductList = JSON.parse(response.body).items.promoted;
	          singleProductList += JSON.parse(response.body).items.regular;
	          // console.log(lista);
						resolve(singleProductList);
	        }else{
	          console.log(response);
	        }
	      }
	    });
		});
  }

	for(let i = 0; i<links.length; i++){
		var lista = await getOneOfferListing(i);
		allProductsList.push(lista);
	}

  return allProductsList;
}
