// ==============================================================
// Tests Scripts

function cb(){
	$("#formTests").submit();
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
	let result = Invoke(KNOWN_ADDRESSES[wI].addressBase58,KNOWN_ADDRESSES[wI].pKeyWif,attachgasfeejs,attachneojs,attachgasjs, invokeScripthash, invokefunc, BASE_PATH_CLI, getCurrentNetworkNickname(), neonJSParams, cb);
});

$("#formTests").submit(function (e) {
	e.preventDefault(); // Prevents the page from refreshing

	var indata = $("#formTests").serialize() + "&" + $("#formInvokeBeforeTest").serialize();

	$.post(
        window.location.origin + '/api/test_case/', // Gets the URL to sent the post to
		indata, // Serializes form data in standard format
		function (data) {
			$("#testbtn")[0].disabled = false;
			$("#resulttests").val(JSON.stringify(data));
			updateTestsArrayAndDraw(data.id, data.contract_hash, data.transaction_hash, data.event_type, data.expected_payload_type, data.expected_payload_value, data.sc_event, data.active, data.success);
		},
		"json" // The format the response should be in
	);  //End of POST for Compile

}); //End of form Compile function

function updateTestsArrayAndDraw(id, contract_hash, transaction_hash, event_type, expected_payload_type, expected_payload_value, sc_event, active, success)
{
	testsArray.push({
		id, 
		contract_hash, 
		transaction_hash, 
		event_type, 
		expected_payload_type,
		expected_payload_value,
		sc_event,
		active, 
		success
	});
	drawTestTable('divCurrentTests');
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
	if (toDeleteTable)
		toDeleteTable.parentNode.removeChild(toDeleteTable);

	if (tableId == 'divSavedTests' && userInfo == null) {
		showAlert('You must be logged in order to see your saved tests', 'danger');
		return;
	}

	let table = document.createElement("table");
	table.id = tableId + '-innerTable';
	table.setAttribute('class', 'table');
	table.style.width = '20px';

	let row = table.insertRow(-1);
	let IDHeader = document.createElement('div');
	let contractHashHeader = document.createElement('div');

	let eventTypeHeader = document.createElement('div');
	let eventPayloadTypeHeader = document.createElement('div');
	let eventPayloadValueHeader = document.createElement('div');
	let optionalHeaderOne = document.createElement('div');
	let optionalHeaderTwo = document.createElement('div');
	if (tableId == 'divCurrentTests') {
		optionalHeaderOne.innerHTML = "<b> Has Runned </b>";
		optionalHeaderTwo.innerHTML = "<b> Success </b>";
	} else if (tableId == 'divSavedTests') {
		optionalHeaderOne.innerHTML = "<b> Name </b>";
		optionalHeaderTwo.innerHTML = "<b> Description </b>";
	}

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
			button.innerHTML = arr[i].id;
			testRow.insertCell(-1).appendChild(button);

			let inputContractHash = document.createElement("input");
			inputContractHash.setAttribute("name", "testContractHash" + i);
			inputContractHash.setAttribute("readonly","true");
			inputContractHash.style.width = '200px';
			inputContractHash.setAttribute("value", arr[i].contract_hash);
			testRow.insertCell(-1).appendChild(inputContractHash);

			if (tableId == 'divCurrentTests') {
				let inputTransactionHash = document.createElement("input");
				inputTransactionHash.setAttribute("name", "testTransactionHash" + i);
				inputTransactionHash.setAttribute("readonly","true");
				inputTransactionHash.style.width = '200px';
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

			let optionalInputOne = document.createElement("input");
			let optionalInputTwo = document.createElement("input");
			optionalInputOne.style.width = '200px';
			optionalInputTwo.style.width = '200px';
			optionalInputOne.setAttribute("readonly", "true");
			optionalInputTwo.setAttribute("readonly", "true");
			

			if (tableId == 'divCurrentTests') {
				optionalInputOne.setAttribute("name", "testHasRunned" + i);
				optionalInputOne.setAttribute("value", !arr[i].active);
				optionalInputTwo.setAttribute("name", "inputTestWasSuccessful" + i);
				optionalInputTwo.setAttribute("value", arr[i].success);
			}

			if (tableId == 'divSavedTests') {
				optionalInputOne.setAttribute("name", "name" + i);
				optionalInputOne.setAttribute("value", arr[i].name);

				optionalInputTwo.setAttribute("name", "description" + i);
				optionalInputTwo.setAttribute("value", arr[i].description);
			}

			testRow.insertCell(-1).appendChild(optionalInputOne);
			testRow.insertCell(-1).appendChild(optionalInputTwo);

			let reRunTestButton = document.createElement("button");
			reRunTestButton.setAttribute('content', 'test content');
			reRunTestButton.setAttribute('class', 'btn btn-warning');
			if (tableId == 'divCurrentTests') {
				reRunTestButton.innerHTML = "Re-Run";
			} else {
				reRunTestButton.innerHTML = 'Run';
			}
			reRunTestButton.data = arr[i];
			reRunTestButton.onclick = reRunTest;
			reRunTestButton.id = i;
			testRow.insertCell(-1).appendChild(reRunTestButton);

			if (userInfo != null) {
				let saveTestButton = document.createElement("button");
				saveTestButton.setAttribute('content', 'test content');
				saveTestButton.setAttribute('class', 'btn btn-warning btn-sm open-testCaseModal');
				if (tableId == 'divCurrentTests') {
					saveTestButton.innerHTML = "Save";
				} else {
					saveTestButton.innerHTML = 'Edit';
				}
				saveTestButton.setAttribute('data-toggle', 'modal');
				saveTestButton.setAttribute('data-target', '#test-case-modal')
				saveTestButton.setAttribute('data-id', arr[i].id);
				testRow.insertCell(-1).appendChild(saveTestButton);
			}

			let addToSuiteButton = document.createElement("button");
			addToSuiteButton.setAttribute('content', 'test content');
			addToSuiteButton.setAttribute('class', 'btn btn-warning');
			addToSuiteButton.innerHTML = "Add To Suite";
			addToSuiteButton.onclick = addToSuiteButton;
			addToSuiteButton.id = i;
			testRow.insertCell(-1).appendChild(addToSuiteButton);
		}
	};

	if (tableId == 'divCurrentTests') {
		cycle(testsArray, tableId);
	} else {
		cycle(savedTestsArray, tableId);
	}

	document.getElementById(tableId).insertBefore(table, document.getElementById('divSavedTestsBody'));
}

$(document).on("click", ".open-testCaseModal", function () {
     let testCaseId= $(this).data('id');
     $(".modal-body #testCaseId").val(testCaseId);
});


$("#test-case-form").submit(function (e) {
	let path = window.location.origin + '/api/test_case/';
    let authHeader = 'Bearer ' + userInfo.access_token;
	e.preventDefault(); // Prevents the page from refreshing
	$("#close-test-modal").click();
	let indata = $('input[name!=testCaseId]', this).serialize();
	let testCaseId = $('input[name=testCaseId]', this).val();
	path = path + testCaseId;

    $.ajax({
        url: path,
        type: 'PUT',
        headers: {
            'Authorization': authHeader
        },
		data: indata,
        success: function (result) {
       		savedTestsArray.push(result);
	   		showAlert('Test saved with success.', 'success');
        },
        error: function (error) {
        	showAlert('Error saving test.', 'danger');
        }
    });

});

function showAlert(message, type) {
	let alertDiv = document.createElement('div');
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

//TODO
function reRunTest() {
	console.log(this.data);
}
//TODO
function addToTestSuite() {

}

function searchForTests() {
	for (i = 0; i < testsArray.length; i++) {
		searchForTest(i, testsArray[i].id);
	}
	drawTestTable('divCurrentTests');
}


function searchForSavedTests() {
	drawTestTable('divSavedTests');
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
			}
		},
		"json" // The format the response should be in
	); //End of GET test_case
}
