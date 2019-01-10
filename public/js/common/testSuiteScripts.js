// ==============================================================
// Test Suite Scripts

function addToTestSuitesArray(testSuiteId, testCase) {
	for (let i = 0; i < testSuitesArray.length; i++) {
		if (testSuitesArray[i].id == testSuiteId) {
			testSuitesArray[i].testCases.push(testCase);
			return true;
		}
	}
	return false;
}

function removeFromTestSuitesArray(id) {
	for (let i = 0; i <testSuitesArray.length; i++) {
		if (testSuitesArray[i].id == id) {
			return true;
		}
	}
	return false;
}

function removeFromSavedTestSuitesArray(id) {
	for (let i = 0; i <savedTestSuitesArray.length; i++) {
		if (savedTestSuitesArray[i].id == id) {
			return true;
		}
	}
	return false;
}

function replaceTestSuite(id, newSuite) {
	for (let i = 0; i < testSuitesArray.length; i++) {
		if (testSuitesArray[i].id == id) {
			testSuitesArray[i] = newSuite;
			return true;
		}
	}
	return false;
}

function replaceSavedTestSuite(id, newSuite) {
	for (let i = 0; i < savedTestSuitesArray.length; i++) {
		if (savedTestSuitesArray[i].id == id) {
			savedTestSuitesArray[i] = newSuite;
			return true;
		}
	}
	return false;
}

function removeTestFromTestSuite(testCaseId, testSuiteId) {
	for (let i = 0; i < testSuitesArray.length; i++) {
		if (testSuitesArray[i].id == testSuiteId) {
			for (let j = 0; j < testSuitesArray[i].testCases.length; j++) {
				if (testSuitesArray[i].testCases[j].id == testCaseId) {
					testSuitesArray[i].testCases.splice(j, 1);
					drawTestSuiteTable('divCurrentTestSuites');
					return true;
				}
			}
		}
	}
	return false;

}

function removeTestFromSavedTestSuite(testCaseId, testSuiteId) {
	for (let i = 0; i < savedTestSuitesArray.length; i++) {
		if (savedTestSuitesArray[i].id == testSuiteId) {
			for (let j = 0; j < savedTestSuitesArray[i].testCases.length; j++) {
				if (savedTestSuitesArray[i].testCases[j].id == testCaseId) {
					savedTestSuitesArray[i].testCases.splice(j, 1);
					drawTestSuiteTable('divSavedTestSuites');
					return true;
				}
			}
		}
	}
	return false;

}

function deleteTestSuite(arrayPos){
	if(arrayPos < testSuitesArray.length && arrayPos > -1)
	{
		testSuitesArray.splice(arrayPos, 1);
		drawTestTable('divCurrentTestSuites');
	} else{
		alert("Cannot remove test with ID " + arrayPos + " from set of tests with size " + testsArray.length);
	}
}

function deleteTestFromSuite(testCase) {
	if (confirm("Are you sure you want to remove this test from the test suite?")){
		let testSuiteId = testCase.testSuiteId;
		let url = window.location.origin + '/api/test_case/' + testCase.id + '/test_suite/0';
		let authHeader = '';
		if (userInfo != null) {
			authHeader = 'Bearer ' + userInfo.access_token;
		}
		$.ajax({
			url: url,
			type: 'PUT',
			headers: {
				'Authorization': authHeader
			},
			success: function (result) {
				if (result.testSuiteID == null) {
					console.log("Success");
				}
				if (!removeFromSavedTestsArray(result.id, testSuiteId)) {
					testsArray.push(result);
				}
				showAlert('Test case removed from suite with success', 'success');
			},
			error: function (error) {
				showAlert('Error removing test from test suite', 'danger');
			}
		});
		updateAllTables();
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
	let toDeleteInnerTables = document.getElementsByClassName(tableId + 'cases');
	for (let a = 0; a < toDeleteInnerTables.length; a++ ) {
		toDeleteInnerTables[a].parentNode.removeChild(toDeleteInnerTables[a]);
	}

	let table = document.createElement("table");
	table.id = tableId + '-innerTable';
   	table.setAttribute('class', 'table');
   	document.getElementById(tableId).insertBefore(table, document.getElementById(tableId + 'Body'));

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
			testSuiteRow.id = i;

			let button = document.createElement('button');
			button.setAttribute('content', 'test content');
			button.setAttribute('class', 'btn btn-danger');
			button.setAttribute('value', i);

			if (tableId == 'divCurrentTestSuites') {
				button.onclick = function () {deleteTestSuite(this.value);};
			}
			if (tableId == 'divSavedTestSuites') {
				button.onclick = function () {deleteSavedTestSuite(this.value);};
			}
			
			button.textContent = arr[i].id;
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
			let num;
			arr[i].testCases? num = arr[i].testCases.length: num = 0;

			numberOfTestCases.setAttribute("name", "nTestCases" + i);
			numberOfTestCases.textContent = num;

			testSuiteRow.insertCell(-1).appendChild(numberOfTestCases);

			let optionalInputOne = document.createElement("span");
			let optionalInputTwo = document.createElement("span");
			
			if (tableId == 'divCurrentTestSuites') {
				optionalInputOne.setAttribute("name", "testSuiteHasRunned" + i);
				optionalInputOne.setAttribute("class", "fas fa-circle-notch fa-spin");
				optionalInputTwo.setAttribute("class", "fas fa-circle-notch fa-spin");

				for (let j = 0; j < num; j++) {
					optionalInputOne.setAttribute("class", "fa fa-check");
					optionalInputTwo.setAttribute("class", "fa fa-check");

					if (arr[i].testCases[j].active) {
						optionalInputOne.setAttribute("class", "fa fa-times");
						break;
					} 
					if (!arr[i].testCases[j].success || arr[i].testCases[j].success == null) {
						optionalInputTwo.setAttribute("class", "fa fa-times");
						break;
					}
				}
				
				testSuiteRow.insertCell(-1).appendChild(optionalInputOne);

				optionalInputTwo.setAttribute("name", "inputTestSuiteWasSuccessful" + i);
				testSuiteRow.insertCell(-1).appendChild(optionalInputTwo);
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

			let runTestSuiteButton = document.createElement("button");
			runTestSuiteButton.setAttribute('content', 'test content');
			runTestSuiteButton.setAttribute('class', 'btn btn-warning');
			runTestSuiteButton.innerHTML = 'Run';
			runTestSuiteButton.id = i;
			runTestSuiteButton.data = arr[i];
			runTestSuiteButton.onclick = function () { runTestSuite(this.data); };
			num == 0 ? runTestSuiteButton.disabled = true: runTestSuiteButton.disabled = false;
			testSuiteRow.insertCell(-1).appendChild(runTestSuiteButton);

			if (userInfo != null) {
				let saveTestSuiteButton = document.createElement("button");
				saveTestSuiteButton.setAttribute('content', 'test content');
				saveTestSuiteButton.setAttribute('class', 'btn btn-warning open-testSuiteModal');
				saveTestSuiteButton.setAttribute("data-id", arr[i].id);
				saveTestSuiteButton.setAttribute("data-name", arr[i].name);
				saveTestSuiteButton.setAttribute("data-description", arr[i].description);
				if (tableId == 'divCurrentTestSuites') {
					saveTestSuiteButton.textContent = "Save";
				} else {
					saveTestSuiteButton.textContent = 'Edit';
				}
				saveTestSuiteButton.setAttribute('data-toggle', 'modal');
				saveTestSuiteButton.setAttribute('data-target', '#test-suite-modal')

				testSuiteRow.insertCell(-1).appendChild(saveTestSuiteButton);
			}
		
			let innerTable = document.createElement("table");
			innerTable.id = tableId + 'TestCaseTable' + i;
			innerTable.setAttribute('class', 'table ' + tableId + 'cases');

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
			if (tableId == 'divCurrentTestSuites') {
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
			
			for (let j = 0; j < num; j++) {
				let testRow = innerTable.insertRow(-1);


				let button = document.createElement('button');
				button.setAttribute('content', 'test content');
				button.setAttribute('class', 'btn btn-danger');
				button.setAttribute('value', j);
				button.data = arr[i].testCases[j];

				button.onclick = function () { deleteTestFromSuite(this.data); };
		
				button.innerHTML = arr[i].testCases[j].id;
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

				let optionalInputOne = document.createElement("span");
				let optionalInputTwo = document.createElement("span");
				

				if (tableId == 'divCurrentTestSuites') {
					
					if (arr[i].testCases[j].active) {
						optionalInputOne.setAttribute("class", "fas fa-circle-notch fa-spin");
						optionalInputTwo.setAttribute("class", "fas fa-circle-notch fa-spin");
					} else {
						arr[i].testCases[j].success? optionalInputTwo.setAttribute("class", "fa fa-check"): optionalInputTwo.setAttribute("class", "fa fa-times");
						optionalInputOne.setAttribute('class', 'fa fa-check');
					}
					
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
				reRunTestButton.data = arr[i].testCases[j];
				//if (arr[i].testCases[j].active || arr[i].testCases[j].active == null) {
				//	reRunTestButton.textContent= "Re-Run";
				//} else {
					reRunTestButton.textContent = 'Run';
				//}
				reRunTestButton.onclick = function () { reRunTest(this.data); };
				reRunTestButton.id = i;
				testRow.insertCell(-1).appendChild(reRunTestButton);

				if (userInfo != null) {
					let saveTestButton = document.createElement("button");
					saveTestButton.setAttribute('content', 'test content');
					saveTestButton.setAttribute('class', 'btn btn-warning open-testCaseModal');
					if (tableId == 'divCurrentTestSuites') {
						saveTestButton.textContent = "Save";
					} else {
						saveTestButton.textContent = 'Edit';
					}
					saveTestButton.setAttribute('data-toggle', 'modal');
					saveTestButton.setAttribute('data-target', '#test-case-modal')
					saveTestButton.setAttribute('data-id', arr[i].testCases[j].id);
					testRow.insertCell(-1).appendChild(saveTestButton);
				}

				let addToSuiteButton = document.createElement("button");
				addToSuiteButton.setAttribute('content', 'test content');
				addToSuiteButton.setAttribute('class', 'btn btn-warning open-addToSuiteModal');
				addToSuiteButton.setAttribute('data-id', arr[i].testCases[j].id);
				addToSuiteButton.setAttribute('data-toggle', 'modal');
				addToSuiteButton.setAttribute('data-target', '#pick-test-suite-modal')
				addToSuiteButton.innerHTML = "Add To Suite";
				addToSuiteButton.onclick = addToSuiteButton;
				addToSuiteButton.id = j;
				testRow.insertCell(-1).appendChild(addToSuiteButton);
			}
			innerTable.hidden = true;;
			testSuiteRow.onclick = () => {
				console.log(innerTable.id);
				document.getElementById(innerTable.id).hidden = !document.getElementById(innerTable.id).hidden;
			};
			console.log(innerTable);
			document.getElementById(tableId).appendChild(innerTable);
		}
	};

	if (tableId == 'divCurrentTestSuites') {
		cycle(testSuitesArray, tableId);
	} else {
		cycle(savedTestSuitesArray, tableId);
	}
}

$(document).on("click", ".open-testSuiteModal", function () {
	let testSuiteId = $(this).data('id');
	let testSuiteName = $(this).data('name');
	let testSuiteDescription = $(this).data('description');

	if (testSuiteId) {
		$(".modal-body #testSuiteId").val(testSuiteId);
		$("#testSuiteModalTitle").innerText = "Edit Test Suite";
		$("#test-suite-name").val(testSuiteName);
		$("#test-suite-description").val(testSuiteDescription);
	} else {
		$(".modal-body #testSuiteId").val("");
	}
});


// Creating (POST) a new test suite or Editing (PUT) a saved test suite
$("#test-suite-form").submit(function (e) {
	e.preventDefault(); // Prevents the page from refreshing
   	$("#close-test-modal").click();
   	let indata = $('input[name!=testSuiteId]', this).serialize();
	let testSuiteId = $('input[name=testSuiteId]', this).val();
	let path = window.location.origin + '/api/test_suite/';
	path = path + testSuiteId;

	if (testSuiteId != '') {
		type = 'PUT';
	} else {
		type = 'POST';
	}
	let authHeader = '';
	if (userInfo != null)
		authHeader = 'Bearer ' + userInfo.access_token;

	$("#close-test-suite-modal").click();

   	$.ajax({
	   	url: path,
	   	type: type,
	   	headers: {
		   	'Authorization': authHeader
	   	},
	   	data: indata,
	   	success: function (result) {
			if (type == 'POST') {
				testSuitesArray.push(result);
				drawTestSuiteTable('divCurrentTestSuites');
				showAlert('Test suite created with success.', 'success');
			} else {
				if (removeFromTestSuitesArray(result.id)) {
					savedTestSuitesArray.push(result);
				} else {
					replaceSavedTestSuite(result.id, result);
				} 
				drawTestSuiteTable('divSavedTestSuites');
				showAlert('Test suite edited with success.', 'success');
			}
			
			
	  	},
	   	error: function (error) {
		   	showAlert('Error saving test.', 'danger');
	   }
   	});

});

function runTestSuite(testSuite) {
	for (let i = 0; i < testSuite.testCases.length; i++) {
		reRunTest(testSuite.testCases[i]);
	}
}

function searchForSavedTestSuites() {
	if (userInfo == null) {
		showAlert("You must be logged in in order to see your saved test suites", "danger");
		return;
	}
	updateAllTables();
}

function searchForTestSuites() {
	for (let i = 0; i < testSuitesArray.length; i++) {
		searchForTestSuite(i, testSuitesArray[i].id);
	}
}

function searchForTestSuite(indexToUpdate, testSuiteID) {
	let path = window.location.origin + '/api/test_suite/' + testSuiteID;
	$.ajax({
        url: path,
        type: 'GET',
        success: function (result) {
		   testSuitesArray[indexToUpdate] = result;
		   drawTestSuiteTable('divCurrentTestSuites');
        },
        error: function (error) {
            alert("Error getting test suite", "danger");
        }
    });
}
