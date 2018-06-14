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
