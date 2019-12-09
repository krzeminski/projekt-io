//jshint esversion:6
const request = require('request');
var superagent = require('superagent');
var latinize = require('latinize');

const limit = 50;
const links = [];
let phraseStart = "https://api.allegro.pl/offers/listing?phrase=";
let phraseEnd =  "&sellingMode.format=BUY_NOW&searchMode=REGULAR&sort=+withDeliveryPrice&limit=" + limit;

//Otrzymujemy access_token do autoryzacji
//async sprawia, ze fukcja czeka na wykonanie getToken()
//wartosc accessToken zwracany jest w then() w app.js
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
            resolve(accessToken);
          }else{
            console.log("Problem with getting access token. HTTP response code: ", response.statusCode);
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

//zamienia linki na liste ofert
exports.getOffersListing = async function(links, token, number){

  var options = {
    url: links[0],
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
	          var simpleProductList = [];
						var listOfOffersForOneProduct = [];
						listOfOffersForOneProduct = JSON.parse(response.body).items.promoted;
	          listOfOffersForOneProduct.concat(JSON.parse(response.body).items.regular);

						for(let i = 0; i<listOfOffersForOneProduct.length; i++){
							var product = {
								flag: number,
								id: listOfOffersForOneProduct[i].id,
								name: listOfOffersForOneProduct[i].name,
								seller: listOfOffersForOneProduct[i].seller.id,
								price: Number(listOfOffersForOneProduct[i].sellingMode.price.amount),
								deliveryPrice: Number(listOfOffersForOneProduct[i].delivery.lowestPrice.amount),
								// priceWithDelivery: Number(listOfOffersForOneProduct[i].sellingMode.price.amount) + Number(listOfOffersForOneProduct[i].delivery.lowestPrice.amount)
							}
								simpleProductList.push(product);
						}
						simpleProductList.sort((a, b) => ((a.price + a.deliveryPrice) > (b.price + b.deliveryPrice)) ? 1 : -1);
						resolve(simpleProductList);
	        }else{
	          console.log("Problem with getting list of offers for one product. HTTP response code: ", response.statusCode);
	        }
	      }
	    });
		});
  }

	return await getOneOfferListing(number);
}

exports.getSellerRating = async function(sellerID, token){
	var url = "https://api.allegro.pl/users/" + sellerID + "/ratings-summary";
  var options = {
    url: url,
    method: "GET",
    headers: {
      "Authorization": "Bearer " + token
    }
  };

  function getSellerReputation(){
    return new Promise(resolve => {
      request(options, function(error, response, body){
        if(error){
          console.log(error);
        }else{
          if(response.statusCode === 200){
						var rating = JSON.parse(response.body).recommendedPercentage;
						rating = rating.split(',').join('.') * 0.05 ;
            resolve(rating);
          }else{
            console.log("Problem with getting seller's reputation. HTTP response code: ", response.statusCode);
          }
        }
      });
    });
  }

  return await getSellerReputation();
}

exports.getDuplicatedSeller = function(allProductsList){
	const unique = new Set();
	const duplicatedSellers = new Set();
	for(let i = 0; i < allProductsList.length; i++){
			allProductsList[i].forEach(function(element){
				if(unique.size === unique.add(element.seller).size){
					duplicatedSellers.add(element.seller);
				}
			});
	}

	return duplicatedSellers;
}


exports.getSellersProducts = function(allProductsList, sellerListWithRating){

	for(let i = 0; i < allProductsList.length; i++){
		// Dla każdej oferty produktu
		allProductsList[i].forEach(function(product){
			// I dla każdego sprzedawcy z reputacją lepszą niż wybraną
			sellerListWithRating.forEach(function(seller){
				//sprawdź czy produkt został wystawiony przez sprzedawcę i dodaj go do tablicy produktów sprzedawcy
				if(product.seller == seller.sellerID){
					seller.products.push({flag: product.flag, id: product.id, price: product.price, deliveryPrice: product.deliveryPrice});
				}
			});
		});
	}

}
function forlater(lista, listaDUplikatow){
	var tempDeliveryCost = 0;
	var tempDeliveryCost2 = 0;
	var cost;
	var savedCost;

	for(let i = 0; i < lista.length; i++){
		savedCost += lista[i][1].price + lista[i][1].deliveryPrice;
	}

	for(let i=0; i < listaDUplikatow.length; i++){
		var productTable = [0,1,2,3,4];
		for(let j=0; j < lista.length; j++){
			var oneItemCost = 1000000000000;
			for(let k=0; k < lista[i].length; k++){
				if(lista[j][k].seller === listaDUplikatow[i] && lista[j][k].price < oneItemCost){
					tempDeliveryCost = Math.max(tempDeliveryCost, lista[j][k].deliveryPrice);
					cost += lista[j][k].price;
					oneItemCost = lista[j][k].price;
					if (productTable.isArray(j)){
						productTable.splice(j, 1);
					}
				}
			}if(oneItemCost != 1000000000000)
			cost += lista[j][k].price;
		}
		for(let m=0; m < productTable.length; m++){
			var oneItemCost = 1000000000000;
			for(let k=0; k < lista[i].length; k++){
				if(lista[j][k].seller === listaDUplikatow[i] && lista[m][k].price < oneItemCost){
					tempDeliveryCost2 = Math.max(tempDeliveryCost2, lista[m][k].deliveryPrice);
					oneItemCost = lista[m][k].price;
					if (productTable.isArray(i)){
						productTable.splice(i, 1);
					}
				}
			}if(oneItemCost != 1000000000000){
				cost += lista[m][k].price + lita[m][k].deliveryPrice;
			}
		}
		cost += tempDeliveryCost + tempDeliveryCost2;
		if(cost < savedCost){
			savedCost = cost;
		}
	}
	return savedCost;
}
