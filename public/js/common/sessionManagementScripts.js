var userInfo;
var testsArray = [];
var testSuitesArray = [];
var savedTestsArray = [];
var savedTestSuitesArray = [];

function init() {
    if (sessionStorage.userInfo) {
        userInfo = JSON.parse(sessionStorage.userInfo);
        checkSessionToken();
    }
}

function checkSessionToken() {
    let path = window.location.origin + '/api/user/checkSessionToken';
    let authHeader = 'Bearer ' + userInfo.access_token;
    $.ajax({
        url: path,
        type: 'GET',
        headers: {
            'Authorization': authHeader
        },
        success: function (result) {
           setLoggedInView();
           getUserTests();
           getUserTestSuites();
        },
        error: function (error) {
            userInfo = null;
            sessionStorage.removeItem('userInfo');
        }
    });
}

function setLoggedInView() {
    let logoutLink = document.createElement('a');
    logoutLink.id = 'logout';
    logoutLink.href ='#';
    logoutLink.setAttribute('onclick', 'logout()');
    let logoutImg = document.createElement('i');
    logoutImg.setAttribute('aria-hidden', 'true');
    logoutImg.className = 'fa fa-external-link-square-alt';
    logoutLink.appendChild(logoutImg);
    let logoutText = document.createTextNode(' Logout');
    logoutLink.appendChild(logoutText);
    let timeout;
    if (document.getElementById("signin") == null) {
        timeout = setTimeout(setLoggedInView, 100)
    } else{
        clearTimeout(timeout);
        document.getElementById("signin").replaceWith(logoutLink);
    }
}

function getUserTests() {
    let path = window.location.origin + '/api/test_cases/';
    let authHeader = 'Bearer ' + userInfo.access_token;
    $.ajax({
        url: path,
        type: 'GET',
        headers: {
            'Authorization': authHeader
        },
        success: function (result) {
            savedTestsArray = [];
            result.forEach((testCase) => {
                savedTestsArray.push(testCase);
            });
            drawTestTable('divSavedTests');
        },
        error: function (error) {
            console.log("Failed");
        }
    });
}

function getUserTestSuites() {
    let path = window.location.origin + '/api/test_suites/';
    let authHeader = 'Bearer ' + userInfo.access_token;
    $.ajax({
        url: path,
        type: 'GET',
        headers: {
            'Authorization': authHeader
        },
        success: function (result) {
            savedTestSuitesArray = [];
            result.forEach((testSuite) => {
                savedTestSuitesArray.push(testSuite);
            });
            drawTestSuiteTable('divSavedTestSuites');
        },
        error: function (error) {
            console.log("Failed");
        }
    });
}


function logout() {
    let path = window.location.origin + '/api/logout/';
    let authHeader = 'Bearer ' + userInfo.access_token;

    if (userInfo != null) {
        userInfo = null;
        sessionStorage.removeItem('userInfo');
        location.reload();
    }

    $.ajax({
        url: path,
        type: 'POST',
        headers: {
            'Authorization': authHeader
        },
        error: function (error) {
            showAlert('Error logging out', 'danger');
        }
    });
}

function updateAllTables() {
    if (userInfo != null) {
        getUserTests();
        getUserTestSuites();
        drawTestSuiteTable('divSavedTestSuites');
        drawTestTable('divSavedTests');
    }
    searchForTests();
    searchForTestSuites();
    drawTestSuiteTable('divCurrentTestSuites');
    drawTestTable('divCurrentTests');
}

window.onload = init;
