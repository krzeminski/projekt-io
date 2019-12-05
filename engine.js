//jshint esversion:6
const request = require('request');
var superagent = require('superagent');

const gettingProducts = [];
let phraseStart = "https://api.allegro.pl/sale/products?phrase=";
let phraseEnd =  "&searchMode=REGULAR&sort=price&limit=3";

exports.getSomeProducts = function(searchedProductsList){
  for(let i = 0; i < searchedProductsList.length; i++){
    gettingProducts.push(
      phraseStart + searchedProductsList[i].productName + phraseEnd
    );
  }
  return gettingProducts;
}


//Otrzymujemy access_token do autoryzacji
exports.getAccessToken = async function(){
	var authUrl = "https://allegro.pl/auth/oauth/token?grant_type=client_credentials";
  var clientId = "9ba1e6fc865c46379cb6afc1fa548b13";
  var clientSecret = "2LRgv5M3FISr783Io0n9FbuQdk57GS19HGQV4TJMpbfahsE7OjwOpnvy1lG5W0V7";
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
