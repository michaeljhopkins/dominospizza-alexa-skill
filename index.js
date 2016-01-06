var alexa       = require('alexa-app'),
    config      = require('config'),
    pizzapi     = require('pizzapi'),
    app         = new alexa.app('Dominos Pizza'),
    modelSchema = {'slots' : {'Phrase': 'LITERAL'},'utterances': ['{order me a pizza|get me a pizza|make me a pizza}']};

/**
 * LaunchRequest.
 */
app.launch(function(request,response) {
	response.say('Hey there fancy pants!');
	response.card("Hey there fancy pants!","This is an example card");
});

/**
 * IntentRequest.
 */
app.intent('pizzaIntent', modelSchema, function(request,response) {
	var myStore    = new pizzapi.Store({ID: config.get("Store.id")}),
	    address    = {Street: config.get("Delivery.street"), City: config.get("Delivery.city"), Region: config.get("Delivery.state"), PostalCode: config.get("Delivery.zip")},
    	myAddress  = new pizzapi.Address(address),
    	customer   = {firstName: config.get("Customer.firstName"), lastName: config.get("Customer.lastName"), address: myAddress, phone: config.get("Customer.phone"), email: config.get("Customer.email")},
    	myCustomer = new pizzapi.Customer(customer),
    	order      = new pizzapi.Order({customer: myCustomer, storeID: config.get("Store.id")});

    // Setup your Default Order
	// 14SCREEN = Large (14") Hand Tossed Pizza Whole: Cheese
	order.addItem(
	    new pizzapi.Item({
	        code: '14SCREEN',
	        options: {},
	        quantity: 1
	    })
	);

	var cardNumber 		  = config.get('Card.num'),
    	cardExp    		  = config.get('Card.exp'),
    	cardCsv    		  = config.get('Card.csv'),
    	cardZip    		  = config.get('Card.zip');
    	cardInfo   		  = new order.PaymentObject,
    	cardInfo.Amount   = order.Amounts.Customer,
    	cardInfo.Number   = cardNumber,
    	cardInfo.CardType = order.validateCC(cardNumber);

	order.Payments.push(cardInfo);

	order.validate(function(result){
		console.log("Order is Validated");
	});
	order.price(function(result) {
		console.log("Order is Priced");
	});
	order.place(function(result) {
		console.log("Price is", result.result.Order.Amounts, "\nEstimated Wait Time",result.result.Order.EstimatedWaitMinutes, "minutes");
		console.log("Order placed!");
	});
});

/**
 * Error handler for any thrown errors.
 */
app.error = function(exception, request, response) {
    response.say('Sorry, something bad happened');
};

exports.schema = function() {
  console.log(app.schema());
};

exports.utterances = function() {
  console.log(app.utterances());
};

// Connect to lambda
exports.handler = app.lambda();