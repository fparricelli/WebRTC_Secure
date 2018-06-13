var login_page = "./login.html";
var registration_servlet = "https://localhost:8443/CertificateServer/register/";
var error_string = "";
var re_mail = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
var re_pwd = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/;
(function ($) {
    "use strict";

    
    /*==================================================================
    [ Validate ]*/
	
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
        	
        	var register_dialog = $.dialog({
        		closeIcon: false,
        		theme: 'modern',
     		    type: 'green',
        	    title: 'Loading...',
    		    icon: 'fa fa-spinner fa-spin',
        	    content: 'Please, wait until server collects information to register!'
        	});
        	
        	var username_var = $('#username').val();
			var password_var = $('#password').val();
			var name_var = $('#name').val();
			var surname_var = $('#surname').val();
			var email_var = $('#email').val();
			var telephone_var = $('#telephone').val();
			$.ajax({

				type : "POST",
				url : registration_servlet,
				data : {
					username : username_var,
					password : password_var,
					name : name_var,
					surname : surname_var,
					email : email_var,
					telephone : telephone_var
				},
				success : function(request) {
					register_dialog.close();
					$.confirm({
						closeIcon: false,
						theme: 'modern',
		     		    type: 'green',
		    		    icon: 'fa fa-check',
					    title: 'Registered!',
					    content: 'Click on Continue to return to Login Page!',
					    buttons: {
					    	btnok : {
					    	btnClass: 'btn-green',
					    	text : 'Continue',
					        action: function () {
					        	window.location.href = login_page;
					        }
					    }
					    }
					    });
				},
				error : function(request) {
					register_dialog.close();

					if (request.status == 409) {
						$.dialog({
							theme: 'modern',
			     		    type: 'red',
			    		    icon: 'fa fa-warning',
						    title: 'Please check your Data!',
						    content: 'Username, Email or Phone already registered!',
						});
					}
					if (request.status == 400) {
						
						//questo codice dovrebbe essere unreachable perché il controllo sugli input viene fatto dal js
						//ma comunque meglio esserne sicuri
						$.dialog({
							theme: 'modern',
			     		    type: 'red',
			    		    icon: 'fa fa-warning',
						    title: 'Please check your Data!',
						    content: 'Please check your inputs',
						});
					}
					if (request.status == 500) {
						$.dialog({
							theme: 'modern',
			     		    type: 'red',
			    		    icon: 'fa fa-warning',
						    title: 'Server Error!',
						    content: 'Please contact application\'s administrator!',
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
		switch($(input).attr('name')){
	/*	case 'username':
            if($(input).val().trim().match(/^[a-zA-Z][a-zA-Z\d-_\.]+$/) == null)
                return false;
		*/case 'email':
            return re_mail.test($(input).val());
		case 'pass':
            return re_pwd.test($(input).val());
		case 'telephone':
        if(isNaN($(input).val()) == true || $(input).val() > 99999 || $(input).val() < 0)
                return false;
         
		default: 
            break;
        }
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