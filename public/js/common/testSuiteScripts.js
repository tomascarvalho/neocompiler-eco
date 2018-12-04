// ==============================================================
// Test Suite Scripts

// function updateTestsArrayAndDraw(id, contract_hash, transaction_hash, event_type, expected_payload_type, expected_payload_value, sc_event, active, success)
// {
// 	testsArray.push({id:id, contract_hash:contract_hash, transaction_hash:transaction_hash, event_type:event_type, expected_payload_type:expected_payload_type, expected_payload_value:expected_payload_value, sc_event: sc_event, active:active, success:success});
// 	drawTestTable('divCurrentTests');
// }

function deleteTestSuite(arrayPos){
	if(arrayPos < testSuitesArray.length && arrayPos > -1)
	{
		testSuitesArray.splice(arrayPos, 1);
		drawTestTable('divCurrentTestSuites');
	} else{
		alert("Cannot remove test with ID " + arrayPos + " from set of tests with size " + testsArray.length);
	}
}

function deleteSavedTestSuite(arrayPos){
	if (arrayPos < savedTestSuitesArray.length && arrayPos > -1)
	{
		if (userInfo != null && confirm("Are you sure you want to delete this test suite?\nDeleting a test suite will also delete all test cases that belong to that test suite!")) {

			let path = window.location.origin + '/api/test_suite/' + savedTestSuitesArray[arrayPos].id;
		    let authHeader = 'Bearer ' + userInfo.access_token;
		    $.ajax({
		        url: path,
		        type: 'DELETE',
		        headers: {
		            'Authorization': authHeader
		        },
				success: function (result) {
					savedTestSuitesArray.splice(arrayPos, 1);
					drawTestTable('divSavedTestSuites');
					showAlert('Test suite deleted successfully', 'success');
				},
		        error: function (error) {
		            showAlert('Error deleting test suite', 'danger');
		        }
		    });
		}

	}else{
		alert("Cannot remove test suite with ID " + arrayPos + " from set of saved test suites with size " + savedTestSuitesArray.length);
	}
}

function drawTestSuiteTable(tableId) {
	//Clear previous data
	let toDeleteTable = document.getElementById(tableId + '-innerTable');
	if (toDeleteTable) {
		toDeleteTable.parentNode.removeChild(toDeleteTable);
	}

	if (tableId == 'divSavedTestSuites' && userInfo == null) {
		showAlert('You must be logged in order to see your saved tests', 'danger');
		return;
	}

	let table = document.createElement("table");
	table.id = tableId + '-innerTable';
   	table.setAttribute('class', 'table');
   	// table.style.width = '2000px';

	let row = table.insertRow(-1);
	
   	let IDHeader = document.createElement('div');
   	let nameHeader = document.createElement('div');
   	let descriptionHeader = document.createElement('div');
	let numberOfTestCasesHeader = document.createElement('div');
	let optionalHeaderOne;
	let optionalHeaderTwo;
	
	if (tableId == 'divCurrentTestSuites') {
		optionalHeaderOne = document.createElement('div');
		optionalHeaderTwo = document.createElement('div');
		optionalHeaderOne.innerHTML = "<b> Has Runned </b>";
		optionalHeaderTwo.innerHTML = "<b> Success </b>";
	}

	IDHeader.innerHTML = "<b> ID </b>";
	row.insertCell(-1).appendChild(IDHeader);
	nameHeader.innerHTML = "<b> Name </b>";
	row.insertCell(-1).appendChild(nameHeader);
	
	descriptionHeader.innerHTML = "<b> Description </b>";
	row.insertCell(-1).appendChild(descriptionHeader);
	
	numberOfTestCasesHeader.innerHTML = "<b> Test Cases </b>";
	row.insertCell(-1).appendChild(numberOfTestCasesHeader);

	if (tableId == 'divCurrentTestSuites') {
		row.insertCell(-1).appendChild(optionalHeaderOne);
		row.insertCell(-1).appendChild(optionalHeaderTwo);
	}

	const cycle = (arr, tableId) => {
		for (i = 0; i < arr.length; i++) {
			let testSuiteRow = table.insertRow(-1);

			let button = document.createElement('button');
			button.setAttribute('content', 'test content');
			button.setAttribute('class', 'btn btn-danger');
			button.setAttribute('value', arr[i].id);

			if (tableId == 'divCurrentTestSuites') {
				button.onclick = function () {deleteTestSuite(this.value);};
			}
			if (tableId == 'divSavedTestSuites') {
				button.onclick = function () {deleteSavedTestSuite(this.value);};
			}
			
			button.innerHTML = arr[i].id;
			testSuiteRow.insertCell(-1).appendChild(document.createElement('div')).appendChild(button);

			let inputName = document.createElement("span");
			inputName.setAttribute("name", "name" + i);
			inputName.textContent = arr[i].name;
			testSuiteRow.insertCell(-1).appendChild(inputName);

			let inputDescription = document.createElement("span");
			inputDescription.setAttribute("name", "name" + i);
			inputDescription.textContent = arr[i].description;
			testSuiteRow.insertCell(-1).appendChild(inputDescription);

			let numberOfTestCases = document.createElement("span");
			numberOfTestCases.setAttribute("name", "nTestCases" + i);
			numberOfTestCases.textContent = arr[i].testCases.length;
			testSuiteRow.insertCell(-1).appendChild(numberOfTestCases);

			let optionalInputOne = document.createElement("input");
			let optionalInputTwo = document.createElement("input");
			
			if (tableId == 'divCurrentTests') {
				optionalInputOne.setAttribute("name", "testSuiteHasRunned" + i);
				optionalInputOne.setAttribute("readonly", "true");
				optionalInputOne.setAttribute("value", "True");

				optionalInputTwo.setAttribute("value", "True");

				for (let j = 0; j < arr[i].testCases.length; j++) {
					if (arr[i].testCases[j].active) {
						optionalInputOne.setAttribute("value", "False");
						optionalInputTwo.setAttribute("value", "In Progress");
						break;
					} 
					if (!arr[i].testCases[j].success) {
						optionalInputTwo.setAttribute("value", "False");
					}
				}
				
				// optionalInputOne.style.width = '50px';
				testRow.insertCell(-1).appendChild(optionalInputOne);

				optionalInputTwo.setAttribute("name", "inputTestSuiteWasSuccessful" + i);
				optionalInputTwo.setAttribute("readonly", "true");
				optionalInputTwo.style.width = '50px';
				testRow.insertCell(-1).appendChild(optionalInputTwo);
			}

			if (tableId == 'divSavedTests') {
				optionalInputOne.setAttribute("name", "name" + i);
				optionalInputOne.setAttribute("readonly", "true");
				optionalInputOne.setAttribute("value", arr[i].name);
				optionalInputOne.style.width = '200px';
				testRow.insertCell(-1).appendChild(optionalInputOne);

				optionalInputTwo.setAttribute("name", "description" + i);
				optionalInputTwo.setAttribute("readonly", "true");
				optionalInputTwo.setAttribute("value", arr[i].description);
				optionalInputTwo.style.width = '200px';
				testRow.insertCell(-1).appendChild(optionalInputTwo);
			}

			let reRunTestSuiteButton = document.createElement("button");
			reRunTestSuiteButton.setAttribute('content', 'test content');
			reRunTestSuiteButton.setAttribute('class', 'btn btn-warning');
			reRunTestSuiteButton.innerHTML = 'Run';

			reRunTestSuiteButton.onclick = runTestSuite;
			reRunTestSuiteButton.id = i;
			testSuiteRow.insertCell(-1).appendChild(reRunTestSuiteButton);

			if (userInfo != null) {
				let saveTestSuiteButton = document.createElement("button");
				saveTestSuiteButton.setAttribute('content', 'test content');
				saveTestSuiteButton.setAttribute('class', 'btn btn-warning btn-sm open-testSuiteModal');
				if (tableId == 'divCurrentTests') {
					saveTestSuiteButton.innerHTML = "Save";
				} else {
					saveTestSuiteButton.innerHTML = 'Edit';
				}
				saveTestSuiteButton.setAttribute('data-toggle', 'modal');
				saveTestSuiteButton.setAttribute('data-target', '#test-case-modal')
				saveTestSuiteButton.setAttribute('data-id', arr[i].id);
				testSuiteRow.insertCell(-1).appendChild(saveTestSuiteButton);
			}

			let toDeleteTable = document.getElementById(tableId + '-innerTable');
			if (toDeleteTable)
				toDeleteTable.parentNode.removeChild(toDeleteTable);

			if (tableId == 'divSavedTests' && userInfo == null) {
				showAlert('You must be logged in order to see your saved tests', 'danger');
				return;
			}
			let div = document.createElement('div');
			let innerTable = document.createElement("table");
			innerTable.id = table.id + '-innerTable';
			innerTable.setAttribute('class', 'table');
			innerTable.style.width = '20px';

			let innerTableRow = innerTable.insertRow(-1);
			let IDHeader = document.createElement('div');
			let contractHashHeader = document.createElement('div');

			let eventTypeHeader = document.createElement('div');
			let eventPayloadTypeHeader = document.createElement('div');
			let eventPayloadValueHeader = document.createElement('div');
			let optionalHeaderOne = document.createElement('div');
			let optionalHeaderTwo = document.createElement('div');
			if (tableId == 'divCurrentTestSuites') {
				optionalHeaderOne.innerHTML = "<b> Has Runned </b>";
				optionalHeaderTwo.innerHTML = "<b> Success </b>";
			} else if (tableId == 'divSavedTestSuites') {
				optionalHeaderOne.innerHTML = "<b> Name </b>";
				optionalHeaderTwo.innerHTML = "<b> Description </b>";
			}

			IDHeader.innerHTML = "<b> ID </b>";
			innerTableRow.insertCell(-1).appendChild(IDHeader);
			contractHashHeader.innerHTML = "<b> Contract Hash </b>";
			innerTableRow.insertCell(-1).appendChild(contractHashHeader);
			if (tableId == 'divCurrentTests') {
				let transactionHashHeader = document.createElement('div');
				transactionHashHeader.innerHTML = "<b> Related Transaction Hash </b>";
				innerTableRow.insertCell(-1).appendChild(transactionHashHeader);
			}
			eventTypeHeader.innerHTML = "<b> Expected Event Type </b>";
			innerTableRow.insertCell(-1).appendChild(eventTypeHeader);
			eventPayloadTypeHeader.innerHTML = "<b> Expected Payload Type </b>";
			innerTableRow.insertCell(-1).appendChild(eventPayloadTypeHeader);
			eventPayloadValueHeader.innerHTML = "<b> Expected Payload Value </b>";
			innerTableRow.insertCell(-1).appendChild(eventPayloadValueHeader);
			innerTableRow.insertCell(-1).appendChild(optionalHeaderOne);
			innerTableRow.insertCell(-1).appendChild(optionalHeaderTwo);
			
			for (let j = 0; j < arr[i].testCases.length; j++) {
				let testRow = innerTable.insertRow(-1);


				let button = document.createElement('button');
				button.setAttribute('content', 'test content');
				button.setAttribute('class', 'btn btn-danger');
				button.setAttribute('value', arr[i].testCases[j].id);

				if (tableId == 'divCurrentTestSuites') {
					button.onclick = function () {deleteTestFromSuite(this.value);};
				}

				if (tableId == 'divSavedTestSuites') {
					button.onclick = function () {deleteSavedTestFromSuite(this.value);};
				}
				button.innerHTML = arr[i].id;
				testRow.insertCell(-1).appendChild(button);

				let inputContractHash = document.createElement("input");
				inputContractHash.setAttribute("name", "testContractHash" + j);
				inputContractHash.setAttribute("readonly","true");
				inputContractHash.style.width = '200px';
				inputContractHash.setAttribute("value", arr[i].testCases[j].contract_hash);
				testRow.insertCell(-1).appendChild(inputContractHash);

				if (tableId == 'divCurrentTestSuites') {
					let inputTransactionHash = document.createElement("input");
					inputTransactionHash.setAttribute("name", "testTransactionHash" + i);
					inputTransactionHash.setAttribute("readonly","true");
					inputTransactionHash.style.width = '200px';
					inputTransactionHash.setAttribute("value", arr[i].testCases[j].transaction_hash);
					testRow.insertCell(-1).appendChild(inputTransactionHash);
				}

				let inputEventType = document.createElement("input");
				inputEventType.setAttribute("name", "testEventType"+i);
				inputEventType.setAttribute("readonly","true");
				inputEventType.setAttribute("value", arr[i].testCases[j].event_type);
				testRow.insertCell(-1).appendChild(inputEventType);

				let inputEventPayloadType = document.createElement("input");
				inputEventPayloadType.setAttribute("name", "testEventPayloadType"+i);
				inputEventPayloadType.setAttribute("readonly","true");
				inputEventPayloadType.setAttribute("value", arr[i].testCases[j].expected_payload_type);
				testRow.insertCell(-1).appendChild(inputEventPayloadType);

				let inputEventPayloadValue = document.createElement("input");
				inputEventPayloadValue.setAttribute("name", "testEventPayloadValue"+i);
				inputEventPayloadValue.setAttribute("readonly","true");
				inputEventPayloadValue.setAttribute("value", arr[i].testCases[j].expected_payload_value);
				testRow.insertCell(-1).appendChild(inputEventPayloadValue);

				let optionalInputOne = document.createElement("input");
				let optionalInputTwo = document.createElement("input");
				optionalInputOne.style.width = '200px';
				optionalInputTwo.style.width = '200px';
				optionalInputOne.setAttribute("readonly", "true");
				optionalInputTwo.setAttribute("readonly", "true");
				

				if (tableId == 'divCurrentTestSuites') {
					optionalInputOne.setAttribute("name", "testHasRunned" + i);
					optionalInputOne.setAttribute("value", !arr[i].testCases[j].active);
					optionalInputTwo.setAttribute("name", "inputTestWasSuccessful" + i);
					optionalInputTwo.setAttribute("value", arr[i].testCases[j].success);
				}

				if (tableId == 'divSavedTestSuites') {
					optionalInputOne.setAttribute("name", "name" + i);
					optionalInputOne.setAttribute("value", arr[i].testCases[j].name);

					optionalInputTwo.setAttribute("name", "description" + i);
					optionalInputTwo.setAttribute("value", arr[i].testCases[j].description);
				}

				testRow.insertCell(-1).appendChild(optionalInputOne);
				testRow.insertCell(-1).appendChild(optionalInputTwo);

				let reRunTestButton = document.createElement("button");
				reRunTestButton.setAttribute('content', 'test content');
				reRunTestButton.setAttribute('class', 'btn btn-warning');
				if (tableId == 'divCurrentTestSuites') {
					reRunTestButton.innerHTML = "Re-Run";
				} else {
					reRunTestButton.innerHTML = 'Run';
				}
				reRunTestButton.onclick = reRunTest;
				reRunTestButton.id = i;
				testRow.insertCell(-1).appendChild(reRunTestButton);

				if (userInfo != null) {
					let saveTestButton = document.createElement("button");
					saveTestButton.setAttribute('content', 'test content');
					saveTestButton.setAttribute('class', 'btn btn-warning btn-sm open-testCaseModal');
					if (tableId == 'divCurrentTestSuites') {
						saveTestButton.innerHTML = "Save";
					} else {
						saveTestButton.innerHTML = 'Edit';
					}
					saveTestButton.setAttribute('data-toggle', 'modal');
					saveTestButton.setAttribute('data-target', '#test-case-modal')
					saveTestButton.setAttribute('data-id', arr[i].testCases[j].id);
					testRow.insertCell(-1).appendChild(saveTestButton);
				}

				let addToSuiteButton = document.createElement("button");
				addToSuiteButton.setAttribute('content', 'test content');
				addToSuiteButton.setAttribute('class', 'btn btn-warning');
				addToSuiteButton.innerHTML = "Add To Suite";
				addToSuiteButton.onclick = addToSuiteButton;
				addToSuiteButton.id = j;
				testRow.insertCell(-1).appendChild(addToSuiteButton);
			}
		
			innerTable.hidden = true;
			testSuiteRow.onclick = () => { 
				innerTable.hidden ? innerTable.hidden = false : innerTable.hidden = true;
			};
			document.getElementById('tests').appendChild(innerTable);
			
		}
	};

	if (tableId == 'divCurrentTestSuites') {
		cycle(testSuitesArray, tableId);
	} else {
		cycle(savedTestSuitesArray, tableId);
	}

	document.getElementById(tableId).insertBefore(table, document.getElementById('divSavedTestSuitesBody'));
}

$(document).on("click", ".open-testCaseModal", function () {
	let testCaseId= $(this).data('id');
	$(".modal-body #testCaseId").val(testCaseId);
});


$("#test-suite-form").submit(function (e) {
	let path = window.location.origin + '/api/test_suite/';
	console.log(path);
    let authHeader = 'Bearer ' + userInfo.access_token;
	e.preventDefault(); // Prevents the page from refreshing
	$("#close-test-suite-modal").click();
	let indata = $(this).serialize();
	console.log(path);
    $.ajax({
        url: path,
        type: 'POST',
        headers: {
            'Authorization': authHeader
        },
		data: indata,
        success: function (result) {
       		testSuitesArray.push(result);
	   		showAlert('Test suite created with success.', 'success');
        },
        error: function (error) {
        	showAlert('Error creating test suite.', 'danger');
        }
    });

});

//TODO
function runTestSuite() {
	console.log(savedTestSuitesArray[this.id]);
}

function searchForTestSuites() {
	drawTestSuiteTable('divCurrentTestSuites');
}

function searchForSavedTestSuites() {
	drawTestSuiteTable('divSavedTestSuites');
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
