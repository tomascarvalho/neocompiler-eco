// ==============================================================
// Tests stuff

const cb = () => {
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
	console.log("Was called");
	var $this = $(this); // `this` refers to the current form element
	var indata = $("#formTests").serialize();
	console.log(indata);
	$.post(
        window.location.origin + $this.attr("action"), // Gets the URL to sent the post to
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
	testsArray.push({id:id, contract_hash:contract_hash, transaction_hash:transaction_hash, event_type:event_type, expected_payload_type:expected_payload_type, expected_payload_value:expected_payload_value, sc_event: sc_event, active:active, success:success});
	drawTestTable();
}

function deleteTest(arrayPos){
	if(arrayPos < testsArray.length && arrayPos > -1)
	{
		testsArray.splice(arrayPos, 1);
		drawTestTable();
	}else{
		alert("Cannot remove test with ID " + arrayPos + " from set of tests with size " + testsArray.length)
	}
}

function drawTestTable(){
	//Clear previous data
	document.getElementById("divCurrentTestsTable").innerHTML = "";
	let table = document.createElement("table");
	table.setAttribute('class', 'table');
	table.style.width = '20px';

	let row = table.insertRow(-1);
	let IDHeader = document.createElement('div');
	let contractHashHeader = document.createElement('div');
	let transactionHashHeader = document.createElement('div');
	let eventTypeHeader = document.createElement('div');
	let eventPayloadTypeHeader = document.createElement('div');
	let eventPayloadValueHeader = document.createElement('div');
	let hasRunnedHeader = document.createElement('div');
	let wasSuccessfulHeader = document.createElement('div');

	IDHeader.innerHTML = "<b> Test ID </b>";
	row.insertCell(-1).appendChild(IDHeader);
	contractHashHeader.innerHTML = "<b> Contract Hash </b>";
	row.insertCell(-1).appendChild(contractHashHeader);
	transactionHashHeader.innerHTML = "<b> Related Transaction Hash </b>";
	row.insertCell(-1).appendChild(transactionHashHeader);
	eventTypeHeader.innerHTML = "<b> Expected Event Type </b>";
	row.insertCell(-1).appendChild(eventTypeHeader);
	eventPayloadTypeHeader.innerHTML = "<b> Expected Payload Type </b>";
	row.insertCell(-1).appendChild(eventPayloadTypeHeader);
	eventPayloadValueHeader.innerHTML = "<b> Expected Payload Value </b>";
	row.insertCell(-1).appendChild(eventPayloadValueHeader);
	hasRunnedHeader.innerHTML = "<b> Has Runned </b>";
	row.insertCell(-1).appendChild(hasRunnedHeader);
	wasSuccessfulHeader.innerHTML = "<b> Success </b>";
	row.insertCell(-1).appendChild(wasSuccessfulHeader);

	for (i = 0; i < testsArray.length; i++) {
		let testRow = table.insertRow(-1);
		//row.insertCell(-1).appendChild(document.createTextNode(i));
		//Insert button that remove rule
		let button = document.createElement('button');
		button.setAttribute('content', 'test content');
		button.setAttribute('class', 'btn btn-danger');
		button.setAttribute('value', i);
		//b.onclick = function () {buttonRemoveRule();};
		//b.onclick = function () {alert(this.value);};
		button.onclick = function () {deleteTest(this.value);};
		button.innerHTML = testsArray[i].id;
		testRow.insertCell(-1).appendChild(button);

		let inputContractHash = document.createElement("input");
		//input.setAttribute("type", "hidden");
		inputContractHash.setAttribute("name", "testContractHash" + i);
		inputContractHash.setAttribute("readonly","true");
		inputContractHash.style.width = '250px';
		inputContractHash.setAttribute("value", testsArray[i].contract_hash);
		testRow.insertCell(-1).appendChild(inputContractHash);

		let inputTransactionHash = document.createElement("input");
		inputTransactionHash.setAttribute("name", "testTransactionHash" + i);
		inputTransactionHash.setAttribute("readonly","true");
		inputTransactionHash.style.width = '250px';
		inputTransactionHash.setAttribute("value", testsArray[i].transaction_hash);
		testRow.insertCell(-1).appendChild(inputTransactionHash);


		let inputEventType = document.createElement("input");
		inputEventType.setAttribute("name", "testEventType"+i);
		inputEventType.setAttribute("readonly","true");
		inputEventType.setAttribute("value", testsArray[i].event_type);
		testRow.insertCell(-1).appendChild(inputEventType);

		let inputEventPayloadType = document.createElement("input");
		inputEventPayloadType.setAttribute("name", "testEventPayloadType"+i);
		inputEventPayloadType.setAttribute("readonly","true");
		inputEventPayloadType.setAttribute("value", testsArray[i].expected_payload_type);
		testRow.insertCell(-1).appendChild(inputEventPayloadType);

		let inputEventPayloadValue = document.createElement("input");
		inputEventPayloadValue.setAttribute("name", "testEventPayloadValue"+i);
		inputEventPayloadValue.setAttribute("readonly","true");
		inputEventPayloadValue.setAttribute("value", testsArray[i].expected_payload_value);
		testRow.insertCell(-1).appendChild(inputEventPayloadValue);

		let inputTestHasRunned = document.createElement("input");
		inputTestHasRunned.setAttribute("name", "testHasRunned" + i);
		inputTestHasRunned.setAttribute("readonly", "true");
		inputTestHasRunned.setAttribute("value", !testsArray[i].active);
		inputTestHasRunned.style.width = '50px';
		testRow.insertCell(-1).appendChild(inputTestHasRunned);

		let inputTestWasSuccessful = document.createElement("input");
		inputTestWasSuccessful.setAttribute("name", "inputTestWasSuccessful" + i);
		inputTestWasSuccessful.setAttribute("readonly", "true");
		inputTestWasSuccessful.setAttribute("value", testsArray[i].success);
		inputTestWasSuccessful.style.width = '50px';
		testRow.insertCell(-1).appendChild(inputTestWasSuccessful);

		let reRunTestButton = document.createElement("button");
		reRunTestButton.setAttribute('content', 'test content');
		reRunTestButton.setAttribute('class', 'btn btn-warning');
		reRunTestButton.setAttribute('value', "Re-run Test");
		reRunTestButton.onclick = reRunTest;
		reRunTestButton.id = i;
		testRow.insertCell(-1).appendChild(reRunTestButton);

	}
	document.getElementById("divCurrentTestsTable").appendChild(table);
}

function reRunTest() {
	console.log(testsArray[this.id]);
}

function searchForTests() {
	for (i = 0; i < testsArray.length; i++) {
		searchForTest(i, testsArray[i].id);
	}
	drawTestTable();
}

function searchForTest(indexToUpdate, testID){
	let path = window.location.origin + '/test_case/' + testID;
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
