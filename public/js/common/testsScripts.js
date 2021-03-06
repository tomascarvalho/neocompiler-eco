// ==============================================================
// Tests Scripts

function removeFromTestsArray(id) {
	for (let i = 0; i < testsArray.length; i++) {
		if (testsArray[i].id == id) {
			testsArray.splice(i, 1);
			drawTestTable('divCurrentTestsTable');
			return true;
		}
	}
	return false;
}

function removeFromSavedTestsArray(id) {
	for (let i = 0; i < savedTestsArray.length; i++) {
		if (savedTestsArray[i].id == id) {
			savedTestsArray.splice(i, 1);
			drawTestTable('divCurrentSavedTestsTable');
			return true;
		}
	}
	return false;
}

function replaceSavedTest(id, newTest) {
	for (let i = 0; savedTestsArray.length; i++) {
		if (savedTestsArray[i].id == id) {
			savedTestsArray[i] = newTest;
			drawTestTable('divCurrentSavedTestsTable');
			return true;
		}
	}
	return false;
}

function cb(testCase, txHash, gasCost){
	var indata = $("#formTests").serialize() + "&" + "active=true" + "&transaction_hash=" + txHash + "&gas_cost=" + gasCost + "&" + $("#formInvokeBeforeTest").serialize();
	$.post(
        window.location.origin + '/api/test_case/', // Gets the URL to sent the post to
		indata, // Serializes form data in standard format
		function (data) {
			$("#testbtn")[0].disabled = false;
			$("#resulttests").val("Test created with success");
			testsArray.push(data);
			updateAllTables();
		},
		"json" // The format the response should be in
	);
};

$("#formInvokeBeforeTest").submit(function(e) {
	e.preventDefault();
	let wI = $("#wallet_invokejsTest")[0].selectedOptions[0].index;
	let attachgasfeejs = Number($("#attachgasfeejsTest").val());
	let attachneojs = Number($("#attachneojsTest").val());
	let attachgasjs = Number($("#attachgasjsTest").val());
	let invokeScripthash = $("#invokehashjsTest").val();

	let invokefunc = "";
	let neonJSParams = [];
	neonJSParams = JSON.parse($("#invokeparamsjsTest")[0].value);
	Invoke(KNOWN_ADDRESSES[wI].addressBase58,KNOWN_ADDRESSES[wI].pKeyWif,attachgasfeejs,attachneojs,attachgasjs, invokeScripthash, invokefunc, BASE_PATH_CLI, getCurrentNetworkNickname(), neonJSParams, cb);
});

$("#importtestbtn").click(function() {
	let editor = ace.edit("editorJavascript").getSession().getValue();
	try {
		const testImport = JSON.parse(editor);
		if ($.isPlainObject(testImport)) {
			parseObject(testImport);
		} else if ($.isArray(testImport)) {
			testImport.forEach(test => {
				if ($.isPlainObject(test)) {
					parseObject(test);
				} else {
					throw("Invalid type");
				}
			});
		} else {
			throw("Invalid type");
		}
	} catch(err) {
		//Display error message
		showAlert(err, "danger");
	}
});

function parseObject(test) {
	if (test.contract_hash == null || test.contract_hash.length != 40)
		throw("Invalid contract hash");
	if (test.event_type == null || test.event_type.indexOf('SmartContract') != 0)
		throw("Invalid event type");
	if (test.expected_payload_type == null)
		throw("Invalid payload type");
	if (test.expected_payload_value == null)
		throw("Invalid payload value");
	if (test.attachgasfeejs == null)
		throw("Invalid attachgasfeejs");
	if (test.attachgasjs == null)
		throw("Invalid attachgasjs")
	if (test.attachneojs == null)
		throw ("Invalid attachneojs");
	if (test.wallet_invokejs.indexOf("wallet_") != 0)
		throw("Invalid wallet");
	if (test.invokehashjs == null || test.invokehashjs.length != 40)
		throw("Invalid invokehashjs");
	if (test.invokeparamsjs == null)
		throw("Invalid invokeparamsjs");
	
	let serializedTest = JSON.stringify(test);
	$("#importtestbtn").disabled = true;
	$.ajax({
		type: 'POST',
		url: window.location.origin + '/api/test_case', // the URL to sent the post to
		data: serializedTest, // Serializes form data in standard format
		dataType: "json",
		contentType: "application/json",
		success: function (data) {
			$("#importtestbtn").disabled = false;
			showAlert("Test created with success", "success");
			testsArray.push(data);
			updateAllTables();
		},
	});
}

function reRunTest(testCase) {
	$("#test_contract_hash").val(testCase.contract_hash);
	$("#test_event_type").val(testCase.event_type);
	$("#test_payload_type").val(testCase.expected_payload_type);
	$("#test_expected_payload_value").val(testCase.expected_payload_value);
	let wI = Number(testCase.wallet_invokejs[testCase.wallet_invokejs.length-1]);
	let invokefunc = "";
	let neonJSParams;
	try {
		neonJSParams = JSON.parse(testCase.invokeparamsjs)
	} catch(err) {
		neonJSParams = "";
	};
	Invoke(KNOWN_ADDRESSES[wI].addressBase58, KNOWN_ADDRESSES[wI].pKeyWif, Number(testCase.attachgasfeejs), Number(testCase.attachneojs), Number(testCase.attachgasjs), testCase.invokehashjs, invokefunc, BASE_PATH_CLI, getCurrentNetworkNickname(), neonJSParams, editTest, testCase);
}


function editTest(testCase, txHash, gasCost) {
	console.log("GAS COST: ");
	console.log(gasCost);
	testCase.transaction_hash = txHash;
	testCase.gas_cost = gasCost;
	testCase.active = true;
	testCase.success = false;
	let path = window.location.origin + '/api/test_case/' + testCase.id;
	let data = $.param(testCase);
	$.ajax({
		url: path,
		type: 'PUT',
		data: data,
		success: updateAllTables,
	});
}

function deleteTest(arrayPos){
	if(arrayPos < testsArray.length && arrayPos > -1)
	{
		testsArray.splice(arrayPos, 1);
		drawTestTable('divCurrentTests');
	}else{
		alert("Cannot remove test with ID " + arrayPos + " from set of tests with size " + testsArray.length)
	}
}

function deleteSavedTest(arrayPos){
	if(arrayPos < savedTestsArray.length && arrayPos > -1)
	{
		if (userInfo != null && confirm("Are you sure you want to delete this test case?")) {

			let path = window.location.origin + '/api/test_case/' + savedTestsArray[arrayPos].id;
		    let authHeader = 'Bearer ' + userInfo.access_token;
		    $.ajax({
		        url: path,
		        type: 'DELETE',
		        headers: {
		            'Authorization': authHeader
		        },
				success: function (result) {
					savedTestsArray.splice(arrayPos, 1);
					drawTestTable('divSavedTests');
					showAlert('Test deleted successfully', 'success');
				},
		        error: function (error) {
		            showAlert('Error deleting test', 'danger');
		        }
		    });
		}

	}else{
		alert("Cannot remove test with ID " + arrayPos + " from set of tests with size " + testsArray.length);
	}
}

function drawTestTable(tableId){
	//Clear previous data
	let toDeleteTable = document.getElementById(tableId + '-innerTable');
	while (toDeleteTable) {
		toDeleteTable.parentNode.removeChild(toDeleteTable);
		toDeleteTable = document.getElementById(tableId + '-innerTable');
	}

	if (tableId == 'divSavedTests' && userInfo == null) {
		showAlert('You must be logged in order to see your saved tests', 'danger');
		return;
	}

	let table = document.createElement("table");
	table.id = tableId + '-innerTable';
	table.setAttribute('class', 'table');
	

	let row = table.insertRow(-1);
	let IDHeader = document.createElement('div');
	let contractHashHeader = document.createElement('div');

	let eventTypeHeader = document.createElement('div');
	let eventPayloadTypeHeader = document.createElement('div');
	let eventPayloadValueHeader = document.createElement('div');
	let optionalHeaderOne = document.createElement('div');
	let optionalHeaderTwo = document.createElement('div');
	// if (tableId == 'divCurrentTests') {
	optionalHeaderOne.innerHTML = "<b> Running </b>";
	optionalHeaderTwo.innerHTML = "<b> Success </b>";
	// } else if (tableId == 'divSavedTests') {
	// 	optionalHeaderOne.innerHTML = "<b> Name </b>";
	// 	optionalHeaderTwo.innerHTML = "<b> Description </b>";
	// }

	IDHeader.innerHTML = "<b> ID </b>";
	row.insertCell(-1).appendChild(IDHeader);
	contractHashHeader.innerHTML = "<b> Contract Hash </b>";
	row.insertCell(-1).appendChild(contractHashHeader);
	if (tableId == 'divCurrentTests') {
		let transactionHashHeader = document.createElement('div');
		transactionHashHeader.innerHTML = "<b> Related Transaction Hash </b>";
		row.insertCell(-1).appendChild(transactionHashHeader);
	}
	eventTypeHeader.innerHTML = "<b> Expected Event Type </b>";
	row.insertCell(-1).appendChild(eventTypeHeader);
	eventPayloadTypeHeader.innerHTML = "<b> Expected Payload Type </b>";
	row.insertCell(-1).appendChild(eventPayloadTypeHeader);
	eventPayloadValueHeader.innerHTML = "<b> Expected Payload Value </b>";
	row.insertCell(-1).appendChild(eventPayloadValueHeader);
	row.insertCell(-1).appendChild(optionalHeaderOne);
	row.insertCell(-1).appendChild(optionalHeaderTwo);
	const cycle = (arr, tableId) => {
		for (i = 0; i < arr.length; i++) {
			let testRow = table.insertRow(-1);

			let button = document.createElement('button');
			button.setAttribute('content', 'test content');
			button.setAttribute('class', 'btn btn-danger');
			button.setAttribute('value', i);

			if (tableId == 'divCurrentTests') {
				button.onclick = function () {deleteTest(this.value);};
			}

			if (tableId == 'divSavedTests') {
				button.onclick = function () {deleteSavedTest(this.value);};
			}
			button.textContent = arr[i].id;
			testRow.insertCell(-1).appendChild(button);

			let inputContractHash = document.createElement("input");
			inputContractHash.setAttribute("name", "testContractHash" + i);
			inputContractHash.setAttribute("readonly","true");
			inputContractHash.style.width = '150px';
			inputContractHash.setAttribute("value", arr[i].contract_hash);
			testRow.insertCell(-1).appendChild(inputContractHash);

			if (tableId == 'divCurrentTests') {
				let inputTransactionHash = document.createElement("input");
				inputTransactionHash.setAttribute("name", "testTransactionHash" + i);
				inputTransactionHash.setAttribute("readonly","true");
				inputTransactionHash.style.width = '175px';
				inputTransactionHash.setAttribute("value", arr[i].transaction_hash);
				testRow.insertCell(-1).appendChild(inputTransactionHash);
			}

			let inputEventType = document.createElement("input");
			inputEventType.setAttribute("name", "testEventType"+i);
			inputEventType.setAttribute("readonly","true");
			inputEventType.setAttribute("value", arr[i].event_type);
			testRow.insertCell(-1).appendChild(inputEventType);

			let inputEventPayloadType = document.createElement("input");
			inputEventPayloadType.setAttribute("name", "testEventPayloadType"+i);
			inputEventPayloadType.setAttribute("readonly","true");
			inputEventPayloadType.setAttribute("value", arr[i].expected_payload_type);
			testRow.insertCell(-1).appendChild(inputEventPayloadType);

			let inputEventPayloadValue = document.createElement("input");
			inputEventPayloadValue.setAttribute("name", "testEventPayloadValue"+i);
			inputEventPayloadValue.setAttribute("readonly","true");
			inputEventPayloadValue.setAttribute("value", arr[i].expected_payload_value);
			testRow.insertCell(-1).appendChild(inputEventPayloadValue);

			let optionalInputOne = document.createElement("span");
			let optionalInputTwo = document.createElement("span");

			optionalInputOne.setAttribute("readonly", "true");
			optionalInputTwo.setAttribute("readonly", "true");
			

			// if (tableId == 'divCurrentTests') {
			if (arr[i].active == true) {
				optionalInputOne.setAttribute("class", "fas fa-circle-notch fa-spin")
			} else if (arr[i].active == false || arr[i].active == null) {
				optionalInputOne.setAttribute("class", "fa fa-times")
			} else {
				optionalInputOne.setAttribute("class", "fa fa-times")
			}
			arr[i].success? optionalInputTwo.setAttribute("class", "fa fa-check"): optionalInputTwo.setAttribute("class", "fa fa-times");
			// }

			// if (tableId == 'divSavedTests') {
			// 	optionalInputOne.setAttribute("name", "name" + i);
			// 	optionalInputOne.setAttribute("value", arr[i].name);

			// 	optionalInputTwo.setAttribute("name", "description" + i);
			// 	optionalInputTwo.setAttribute("value", arr[i].description);
			// }

			testRow.insertCell(-1).appendChild(optionalInputOne);
			testRow.insertCell(-1).appendChild(optionalInputTwo);

			let reRunTestButton = document.createElement("button");
			reRunTestButton.setAttribute('content', 'test content');
			reRunTestButton.setAttribute('class', 'btn btn-warning');
			// if (tableId == 'divCurrentTests') {
			reRunTestButton.innerHTML = "Run";
			// } else {
			// 	reRunTestButton.innerHTML = 'Run';
			// }
			reRunTestButton.data = arr[i];
			reRunTestButton.onclick = function () { reRunTest(this.data); };
			reRunTestButton.id = tableId + 'reTest' + i;
			testRow.insertCell(-1).appendChild(reRunTestButton);

			if (userInfo != null) {
				let saveTestButton = document.createElement("button");
				saveTestButton.setAttribute('content', 'test content');
				saveTestButton.setAttribute('class', 'btn btn-warning open-testCaseModal');
				if (tableId == 'divCurrentTests') {
					saveTestButton.innerHTML = "Save";
				} else {
					saveTestButton.innerHTML = 'Edit';
				}
				saveTestButton.setAttribute('data-toggle', 'modal');
				saveTestButton.setAttribute('data-target', '#test-case-modal')
				saveTestButton.setAttribute('data-id', arr[i].id);
				saveTestButton.setAttribute("data-name", arr[i].name);
				saveTestButton.setAttribute("data-description", arr[i].description);
				saveTestButton.setAttribute("data-contract_hash", arr[i].contract_hash);
				saveTestButton.setAttribute("data-payload_value", arr[i].expected_payload_value);
				testRow.insertCell(-1).appendChild(saveTestButton);
			}

			let addToSuiteButton = document.createElement("button");
			addToSuiteButton.setAttribute('content', 'test content');
			addToSuiteButton.setAttribute('class', 'btn btn-warning open-addToSuiteModal');
			addToSuiteButton.setAttribute("data-toggle", "modal");
			addToSuiteButton.setAttribute("data-id", arr[i].id);
			addToSuiteButton.setAttribute("data-target", "#pick-test-suite-modal");
			addToSuiteButton.innerHTML = "Add To Suite";
			addToSuiteButton.id = i;
			testRow.insertCell(-1).appendChild(addToSuiteButton);

			let infoButton = document.createElement("button");
			infoButton.setAttribute('content', 'test content');
			infoButton.setAttribute('class', 'btn btn-warning open-testInfoModal');
			infoButton.setAttribute("data-toggle", "modal");
			infoButton.setAttribute("data-test", JSON.stringify(arr[i]));

			infoButton.setAttribute("data-target", "#info-modal");
			infoButton.innerHTML = "Info";
			infoButton.id = "infoButton" + i;
			testRow.insertCell(-1).appendChild(infoButton);
		}
	};

	if (tableId == 'divCurrentTests') {
		cycle(testsArray, tableId);
	} else {
		cycle(savedTestsArray, tableId);
	}

	document.getElementById(tableId).insertBefore(table, document.getElementById(tableId + 'Body'));
}

$(document).on("click", ".open-testCaseModal", function () {
	 let testCaseId= $(this).data('id');
	 let testCaseHash = $(this).data('contract_hash');
	 let testCasePayloadValue = $(this).data('payload_value');
	 let testCaseName = $(this).data('name');
	 let testCaseDescription = $(this).data('description');

	 $(".modal-body #testCaseId").val(testCaseId);
	 $(".modal-body #test-case-hash").val(testCaseHash);
	 $(".modal-body #test-case-name").val(testCaseName);
	 $(".modal-body #test-case-description").val(testCaseDescription);
	 $(".modal-body #test-case-event-payload-value").val(testCasePayloadValue);

});


// Creating (POST) a new test case or Editing (PUT) a save case
$("#test-case-form").submit(function (e) {
	e.preventDefault(); // Prevents the page from refreshing
	$("#close-test-modal").click();
	let authHeader = '';
	let path = window.location.origin + '/api/test_case/';
	let testCaseId = $('input[name=testCaseId]', this).val();
	let indata = '';
	
	if (testCaseId != '') {
		type = 'PUT';
		indata = $(this).serialize();
	} else {
		type = 'POST';
		indata = $("#formTests").serialize() + "&" + $("#formInvokeBeforeTest").serialize() + '&' + $('input[name!=testCaseId]', this).serialize();
	}
	
	if (userInfo != null) {
		authHeader = 'Bearer ' + userInfo.access_token;
	}	

	path = path + testCaseId;

   	$.ajax({
	   	url: path,
	   	type: type,
	   	headers: {
		   	'Authorization': authHeader
	   	},
	   	data: indata,
	   	success: function (result) {
			if (type == 'POST') {
				testsArray.push(result);
				showAlert('Test created with success', 'success');
			} else {
				showAlert('Test case edited with success.', 'success');
				if (removeFromTestsArray(result.id)) {
					savedTestsArray.push(result);
				} else {
					replaceSavedTest(result.id, result);
				} 			}
			updateAllTables();
	  	},
	   	error: function (error) {
		   	showAlert('Error saving test.', 'danger');
	   }
   	});

});

function showAlert(message, type) {
	$("#alertDiv").remove();
	let alertDiv = document.createElement('div');
	alertDiv.id = "alertDiv";
	alertDiv.setAttribute('class', 'alert alert-' + type + ' alert-dismissible show');
	alertDiv.setAttribute('role', 'alert');
	let text = document.createTextNode(message);
	alertDiv.appendChild(text);
	let closeButton = document.createElement('button');
	closeButton.setAttribute('type', 'button');
	closeButton.setAttribute('class', 'close');
	closeButton.setAttribute('data-dismiss', 'alert');
	closeButton.setAttribute('aria-label', 'close');
	let span = document.createElement('span');
	span.setAttribute('aria-hidden', 'true');
	span.innerHTML = '&times;';
	closeButton.appendChild(span);
	alertDiv.appendChild(closeButton);
	document.getElementById('neocompilertopbar').appendChild(alertDiv);
}


$(document).on("click", ".open-addToSuiteModal", function() {
	let testCaseId= $(this).data('id');
	$("#pick-test-suite-form #testCaseId").val(testCaseId);
});

$(document).on("click", ".open-testInfoModal", function() {
	let testCase= $(this).data('test');
	let sc_event = testCase.sc_event;
	try {
		sc_event = JSON.parse(sc_event);
	} catch(err) {
		console.log(err);
	}
	testCase.name == null ? $("#testModalDiv #test-name").text("Test name: N/A") : $("#testModalDiv #test-name").text("Test name: " + testCase.name);
	testCase.description == null ? $("#testModalDiv #test-description").text("Test description: N/A") : $("#testModalDiv #test-description").text("Test description: " + testCase.description);
	testCase.active == null? $("#testModalDiv #has-runned").text("Test has not run yet") : $("#testModalDiv #has-runned").text("Test is active: " + testCase.active);
	$("#testModalDiv #success").text("Test success: " + testCase.success);
	testCase.gas_cost == null? $("#testModalDiv #gas-cost").text("Gas cost: N/A") : $("#testModalDiv #gas-cost").text("Gas cost: " + testCase.gas_cost);
	$("#testModalDiv #expected-event-payload").text("Expected event payload: " + testCase.expected_payload_value);

	if (sc_event == null) {
		$("#testModalDiv #sc-event").text("Listened event: N/A");
		$("#testModalDiv #sc-event").text("Listened event: ");
		$("#testModalDiv #sc-event-type").text("Event type: " + sc_event.event_type);
		$("#testModalDiv #sc-event-contract-hash").text("Contract hash: " + sc_event.contract_hash);
		$("#testModalDiv #sc-event-transaction-hash").text("Transaction hash: " + sc_event.tx_hash);
		$("#testModalDiv #sc-event-block-number").text("Block number: " + sc_event.block_number);
		$("#testModalDiv #sc-event-payload-type").text("Payload Type: " + sc_event.event_payload.type);
		$("#testModalDiv #sc-event-payload-value").text("Payload value: " + sc_event.event_payload.value);
	} else {
		$("#testModalDiv #sc-event").text("Listened event: ");
		$("#testModalDiv #sc-event-type").text("Event type: " + sc_event.event_type);
		$("#testModalDiv #sc-event-contract-hash").text("Contract hash: " + sc_event.contract_hash);
		$("#testModalDiv #sc-event-transaction-hash").text("Transaction hash: " + sc_event.tx_hash);
		$("#testModalDiv #sc-event-block-number").text("Block number: " + sc_event.block_number);
		$("#testModalDiv #sc-event-payload-type").text("Payload Type: " + sc_event.event_payload.type);
		$("#testModalDiv #sc-event-payload-value").text("Payload value: " + sc_event.event_payload.value);

	}

});


// Adds a test to a test suite
$(document).on("click", "#add-to-suite-button", function (e) {
	e.preventDefault(); // Prevents the page from refreshing
	$("#close-add-to-test-suite-modal").click();
	console.log("CLICK");
	var indata = $("#formTests").serialize() + "&" + $("#formInvokeBeforeTest").serialize();
	let testSuiteID = $("#select-test-suite-id").val();
	let testCaseId = $("#pick-test-suite-form #testCaseId").val();
	let createTestPath = window.location.origin + '/api/test_case/';


	if (testCaseId != '') {
		let addTestToSuitePath = window.location.origin + '/api/test_case/' + testCaseId + '/test_suite/' + testSuiteID;
		$.ajax({
			url: addTestToSuitePath,
			type: 'PUT',
			success: function (result) {
				if (!removeFromTestsArray(result.id)) {
					removeFromSavedTestsArray(result.id);
				}
				
				updateAllTables();

				showAlert('Test added to suite successfully', 'success');
			},
			error: function (error) {
				showAlert('Error adding test to suite', 'danger');
			}
		});
	} else {
		$.ajax({
			url: createTestPath,
			type: 'POST',
			data: indata,
			success: function (result) {
				let addTestToSuitePath = window.location.origin + '/api/test_case/' + result.id + '/test_suite/' + testSuiteID;
				$.ajax({
					url: addTestToSuitePath,
					type: 'PUT',
					success: function (result) {
						for (let i = 0 ; i < testSuitesArray.length; i++) {
							if (testSuitesArray[i].id == result.testSuiteID) {
								testSuitesArray[i].testCases.push(result);
								break;
							}
						}
						updateAllTables();
						showAlert('Test added to suite successfully', 'success');
					},
					error: function (error) {
						showAlert('Error adding test to suite', 'danger');
					}
				});
			},
			error: function (error) {
				showAlert('Error adding test to suite', 'danger');
			}
		});
	}
	
});


function searchForTests() {
	for (i = 0; i < testsArray.length; i++) {
		searchForTest(i, testsArray[i].id);
	}
}


function searchForSavedTests() {
	if (userInfo == null) {
		showAlert("You must be logged in in order to see your saved tests", "danger");
		return;
	}
	getUserTests();
}

function searchForTest(indexToUpdate, testID) {
	let path = window.location.origin + '/api/test_case/' + testID;
	$.get(
		path, // Gets the URL to sent the post to
		function (data) {
			if (!data.active) {
				testsArray[indexToUpdate].active = data.active;
				testsArray[indexToUpdate].success = data.success;
				testsArray[indexToUpdate].sc_event = JSON.parse(data.sc_event);
				drawTestTable('divCurrentTests');
			}
		},
		"json" // The format the response should be in
	); //End of GET test_case
}
