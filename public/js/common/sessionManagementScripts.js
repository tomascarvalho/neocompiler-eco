var userInfo;

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
        },
        error: function (error) {
            console.log("Failed");
        }
    });

    // $.get(
    //     path,
    //     function (data) {
    //         setLoggedInView();
    //     },
    //     "json"
    // )
    // .fail(() => console.log("nay"));
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

function logout() {
    let path = window.location.origin + '/api/logout/';
    let authHeader = 'Bearer ' + userInfo.access_token;

    if (userInfo != null) {
        location.reload();
    }

    $.ajax({
        url: path,
        type: 'POST',
        headers: {
            'Authorization': authHeader
        },
        success: function (result) {
           setLoggedInView();
        },
        error: function (error) {
            console.log("Failed");
        }
    });

    // $.post(
	// 	path,
    //     headers: {
    //         'Authorization': authHeader,
    //     },
	// 	function (data) {
	// 		console.log(data);
    //         userInfo = null;
    //         location.reload();
	// 	},
    //     "json"
	// )
    // .fail(() => console.log("nay"));

}

window.onload = init;
