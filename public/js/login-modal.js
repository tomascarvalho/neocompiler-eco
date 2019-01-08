jQuery(document).ready(function($){
	var $form_modal = $('.cd-user-modal'),
		$form_login = $form_modal.find('#cd-login'),
		$form_signup = $form_modal.find('#cd-signup'),
		$form_forgot_password = $form_modal.find('#cd-reset-password'),
		$form_modal_tab = $('.cd-switcher'),
		$tab_login = $form_modal_tab.children('li').eq(0).children('a'),
		$tab_signup = $form_modal_tab.children('li').eq(1).children('a'),
		$forgot_password_link = $form_login.find('.cd-form-bottom-message a'),
		$back_to_login_link = $form_forgot_password.find('.cd-form-bottom-message a'),
		$main_nav = $('.main-nav'),
		$signin = $('#signin');

	//open modal
	$signin.on('click', function(event){

		if( $(event.target).is($main_nav) ) {
			// on mobile open the submenu
			main_nav.children('ul').toggleClass('is-visible');
		} else {
			// on mobile close submenu
			$main_nav.children('ul').removeClass('is-visible');
			//show modal layer
			$form_modal.addClass('is-visible');
			//show the selected form
			( $(event.target).is('.cd-signup') ) ? signup_selected() : login_selected();
		}

	});

	//close modal
	$('.cd-user-modal').on('click', function(event){
		if( $(event.target).is($form_modal) || $(event.target).is('.cd-close-form') ) {
			$form_modal.removeClass('is-visible');
		}
	});
	//close modal when clicking the esc keyboard button
	$(document).keyup(function(event){
    	if(event.which=='27'){
    		$form_modal.removeClass('is-visible');
	    }
    });

	//switch from a tab to another
	$form_modal_tab.on('click', function(event) {
		event.preventDefault();
		( $(event.target).is( $tab_login ) ) ? login_selected() : signup_selected();
	});

	function login_selected(){
		$form_login.addClass('is-selected');
		$form_signup.removeClass('is-selected');
		$form_forgot_password.removeClass('is-selected');
		$tab_login.addClass('selected');
		$tab_signup.removeClass('selected');
	}

	function signup_selected(){
		$form_login.removeClass('is-selected');
		$form_signup.addClass('is-selected');
		$form_forgot_password.removeClass('is-selected');
		$tab_login.removeClass('selected');
		$tab_signup.addClass('selected');
	}

	function forgot_password_selected(){
		$form_login.removeClass('is-selected');
		$form_signup.removeClass('is-selected');
		$form_forgot_password.addClass('is-selected');
	}

});


//credits https://css-tricks.com/snippets/jquery/move-cursor-to-end-of-textarea-or-input/
jQuery.fn.putCursorAtEnd = function() {
	return this.each(function() {
    	// If this function exists...
    	if (this.setSelectionRange) {
      		// ... then use it (Doesn't work in IE)
      		// Double the length because Opera is inconsistent about whether a carriage return is one character or two. Sigh.
      		var len = $(this).val().length * 2;
      		this.setSelectionRange(len, len);
    	} else {
    		// ... otherwise replace the contents with itself
    		// (Doesn't work in Google Chrome)
      		$(this).val($(this).val());
    	}
	});
};

document.getElementById("signup-password-confirm").addEventListener('input', () => {
	if (document.getElementById("signup-password-confirm").value != document.getElementById('signup-password').value) {
		// input is invalid -- show error message
		$("#signup-password-confirm").toggleClass('has-error', true).next('span').toggleClass('is-visible', true);
	} else {
		// input is valid -- hide error message
		$("#signup-password-confirm").toggleClass('has-error', false).next('span').toggleClass('is-visible', false);
	}
});


document.getElementById("signup-email").addEventListener('input', () => {
	$("#signup-email").toggleClass('has-error', false).next('span').toggleClass('is-visible', false);
});

document.getElementById("signinform").addEventListener('submit', (e) => {
	$("#signinbtn").toggleClass('has-error', false).next('span').toggleClass('is-visible', false);
	e.preventDefault();
	let path = window.location.origin + '/api/login';
	let indata = $("#signinform").serialize();

	$.post(
		path, // The URL to sent the post to
		indata,
		function (data) {
			sessionStorage["userInfo"] = JSON.stringify(data);
			$('.cd-user-modal').removeClass("is-visible");
			document.getElementById('signinform').reset();
			document.getElementById('signupform').reset();
			init();
		},
		"json" // The format the response should be in
	).fail(function() {
		sessionStorage["userInfo"] = null;
		$("#signin-password").toggleClass('has-error', true).next('span').toggleClass('is-visible', true);
	}); //End of POST for signin
});


document.getElementById("signupform").addEventListener('submit', (e) => {
	$("#signupbtn").toggleClass('has-error', false).next('span').toggleClass('is-visible', false);
	e.preventDefault();
	let path = window.location.origin + '/api/user';
	let indata = $("#signupform").serialize();
	$.post(
		path, // The URL to sent the post to
		indata,
		function (data) {
			$("#signin-email").val(data.username);
			$("#signin-link").click();
			alert("User created with success. Please log in");
		},
		"json" // The format the response should be in
	).fail(function(jqXHR, textStatus, errorThrown) {
		if (JSON.parse(jqXHR.responseText)["status"]  != "Passwords don't match")
			$("#signup-email").toggleClass('has-error', true).next('span').toggleClass('is-visible', true);
	}); //End of POST for signin
});

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}
