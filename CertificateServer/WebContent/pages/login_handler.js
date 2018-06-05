var contact_page = "./chat.html";
var register_page = "./register.html";
var two_factors_page = "./two_factors.html";


(function ($) {
    "use strict";

    
    /*==================================================================
    [ Validate ]*/
    resetStorage();
	
    var input = $('.validate-input .input100');

    $('.validate-form').on('submit',function(e){
		e.preventDefault();
    	var check = true;
        
        for(var i=0; i<input.length; i++) {
            if(validate(input[i]) == false){
                showValidate(input[i]);
                check=false;
            }
        }
        
        if(check == true){
        	
        	// Se sono qui sono bravo a scrivere 
        	
        	var login_dialog = $.dialog({
        		closeIcon: false,
        		theme: 'modern',
     		    type: 'green',
        	    title: 'Loading...',
    		    icon: 'fa fa-spinner fa-spin',
        	    content: 'Please, wait until server collects information to login!'
        	});
        	
        	var username_var = $('#username').val();
			var password_var = $('#password').val();
			$.ajax({
				type : "POST",
				url : "https://localhost:8443/CertificateServer/authenticate/",
				dataType : "json",
				data : {
					username : username_var,
					password : password_var
				},
				success : function(data) {
					login_dialog.close();
					$.dialog({
						closeIcon: false,
						theme: 'modern',
		     		    type: 'green',
		    		    icon: 'fa fa-check',
					    title: 'Success!',
					    content: 'You will be redirected shortly to your Home Page!',
					});
					setStorage(data,
							username_var);
					goToPage(contact_page);
					//goToPage(contact_page, true);
				},
				error : function(request,
						textStatus,
						errorThrown) {
					login_dialog.close();

					console
							.log('Sbagliato');
					console.log(textStatus);
					console
							.log(request.status);
					if (request.status == 307) {
						setTemporaryStorage(
								request,
								username_var);
						goToPage(two_factors_page);
						//goToPage(two_factors_page, false);

					} else if (request.status == 500) {
						$.dialog({
							theme: 'modern',
			     		    type: 'red',
			    		    icon: 'fa fa-warning',
						    title: 'Server Error!',
						    content: 'Please contact application\'s administrator!',
						});
					} else if (request.status == 403) {
						$.dialog({
							theme: 'modern',
			     		    type: 'red',
			    		    icon: 'fa fa-warning',
						    title: 'Account or IP Locked!',
						    content: 'Please contact application\'s administrator to unlock your account!',
						});
					}
					 else if (request.status == 400) {
							$.dialog({
								theme: 'modern',
				     		    type: 'red',
				    		    icon: 'fa fa-warning',
							    title: 'Missing parameters!',
							    content: 'Please control your inputs',
							});
						}
					else if (request.status == 401) {
						$.dialog({		
							theme: 'modern',
			     		    type: 'red',
			    		    icon: 'fa fa-warning',
						    title: 'Wrong Credential!',
						    content: 'Please check your credentials!',
						});
						
						
					}
				}
			});
        }
    });


    $('.validate-form .input100').each(function(){
        $(this).focus(function(){
           hideValidate(this);
        });
    });

    function validate (input) {
        if($(input).val().trim() == '')
            return false;
	/*	switch($(input).attr('name')){
		case 'username':
            if($(input).val().trim().match(/^[a-zA-Z][a-zA-Z\d-_\.]+$/) == null)
                return false;
		default: 
			break;
        }*/
    }

    function showValidate(input) {
        var thisAlert = $(input).parent();

        $(thisAlert).addClass('alert-validate');
    }

    function hideValidate(input) {
        var thisAlert = $(input).parent();

        $(thisAlert).removeClass('alert-validate');
    }
    
    

})(jQuery);

/*$(document)
		.ready(
				function() {
					console.log('Pronto');
					resetStorage();
					$("#login_form")
							.submit(
									function(e) {
										e.preventDefault();
										document.getElementById("login_failed").innerHTML = "";
										var username_var = $("#username").val();
										var password_var = $("#password").val();
										// var dati = new FormData();
										// dati.append('username',username);
										// dati.append('password',password);
										//console.log(username_var);
										console.log('Submit inserito');
										
										 * var request = new XMLHttpRequest();
										 * console.log('Creo ' +
										 * request.readyState);
										 * request.open('POST','https://localhost:8443/CertificateServer/authenticate/',true);
										 * request.setRequestHeader('Content-Type','application/x-www-form-urlencoded'); //
										 * request.setRequestHeader('Content-Length',
										 * dati.length); //
										 * request.setRequestHeader('Connection',
										 * 'close'); console.log('Apro ' +
										 * request.readyState);
										 * request.send('username='+username+'&password='+password);
										 * console.log('Mando ' +
										 * request.readyState);
										 * request.onreadystatechange = function () {
										 * console.log(request.status);
										 * if(request.readyState==4) {
										 * console.log('Risposta ' +
										 * request.status); } }
										 
										$
												.ajax({
													type : "POST",
													url : "https://localhost:8443/CertificateServer/authenticate/",
													dataType : "json",
													data : {
														username : username_var,
														password : password_var
													},
													success : function(data) {
														// document.getElementById("login_failed").innerHTML
														// = "Successful login";
													    //console.log(data);
														// console.log(data);
														// console.log(token);
														// console.log(name);
														// console.log(surname);
														// console.log(role);
														// console.log(roleNumber);
														// console.log(telephone);
														setStorage(data,
																username_var);
														// console.log(sessionStorage.getItem("token"));
														goToPage(contact_page);
													},
													error : function(request,
															textStatus,
															errorThrown) {
														console
																.log('Sbagliato');
														console.log(textStatus);
														console
																.log(request.status);
														if (request.status == 307) {
															document
																	.getElementById("login_failed").innerHTML = "Confirmation mail Sent. Activate your account using the mail we sent";
															setTemporaryStorage(
																	request,
																	username_var);
															goToPage(two_factors_page);

														} else if (request.status == 500) {
															document
																	.getElementById("login_failed").innerHTML = "Server errror";
														} else if (request.status == 403) {
															document
																	.getElementById("login_failed").innerHTML = "Account or IP locked."
														}

														else if (request.status == 401) {
															document
																	.getElementById("login_failed").innerHTML = "Wrong credentials"
														}

													}

												})
									});
					$("#register").click(function() {
						console.log('Click su register');
						window.location.href = register_page;
					});
				});
*/
				
/*
 * UTILITY FUNCTIONS
 */
function setStorage(data, username) {
	var token = data.token;
	var name = data.name;
	var surname = data.surname;
	var role = data.role;
	var roleNumber = data.roleN;
	var telephone = data.telephone;
	sessionStorage.setItem("username", username);
	sessionStorage.setItem("token", token);
	sessionStorage.setItem("name", name);
	sessionStorage.setItem("surname", surname);
	sessionStorage.setItem("role", role);
	sessionStorage.setItem("roleNumber", roleNumber);
	sessionStorage.setItem("telephone", telephone);
}

function goToPage(page) {
	window.location.href = page;
	
}

/*function goToPage(page, red){
	
	var token = sessionStorage.getItem("token");
	
	if(red){
		window.location.href = page+"?param="+token;
		//redirectWithToken(page);
	}else{
		window.location.href = page;
	}
}*/

function setTemporaryStorage(data, username) {
	sessionStorage.setItem("twoFactorsUsername", username);
}

function resetStorage() {
	sessionStorage.setItem("token", "");
	sessionStorage.setItem("name", "");
	sessionStorage.setItem("surname", "");
	sessionStorage.setItem("role", "");
	sessionStorage.setItem("roleNumber", "");
	sessionStorage.setItem("telephone", "");
}

/*function redirectWithToken(page){

	$.ajax({
		type : "POST",
		url : page,
		dataType : "json",
		data : {
			param: sessionStorage.getItem("token")
		},
    
		success : function(response, textStatus, xhr) {
			console.log(response);
			console.log(response.redirect_url);
			alert("Ricevuto redirect (success)!");
			window.location.href = response.redirect_url;
		},
    
		error : function(request, textStatus, errorThrown) {
			if(request.status == 307){
				console.log(response);
				console.log(response.redirect_url);
				alert("Ricevuto redirect (error)!");
				window.location.href = response.redirect_url;
			}else{
				console.log("Redirect Error!");
			}		
		}
     
});

}
*/
