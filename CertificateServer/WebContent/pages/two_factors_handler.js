var login_page = "./login.html";
var two_factors_servlet = "https://localhost:8443/CertificateServer/twofactors/";
var error_string = "";
var temporary_username = "";
var code = "";

(function ($) {
    "use strict";

    
    /*==================================================================
    [ Validate ]*/
	temporary_username = sessionStorage.getItem("twoFactorsUsername");

    var input = $('.validate-input .input100');

    $('.validate-form').on('submit',function(e){
		e.preventDefault();
    	var check = true;
    	
    	if(validate(input[0]) == false){
            showValidate(input[0]);
            check=false;
    	}
        
        if(check == true){
        	
        	// Se sono qui sono bravo a scrivere 
        	
        	var check_dialog = $.dialog({
        		closeIcon: false,
        		theme: 'modern',
     		    type: 'green',
        	    title: 'Loading...',
    		    icon: 'fa fa-spinner fa-spin',
        	    content: 'Please, wait until server checks code!'
        	});
        	
        	var code = $('#vercode').val();
        	$.ajax({
				type : "POST",
				url: two_factors_servlet,
				data : {
					username : temporary_username,
					code : code
				},
				success: function(data)
				{
					check_dialog.close();
					$.confirm({
						closeIcon: false,
						theme: 'modern',
		     		    type: 'green',
		    		    icon: 'fa fa-check',
					    title: 'Verification Code Correct!',
					    content: 'Click Continue to Login!',
					    buttons: {
					    	btnok : {
					    	btnClass: 'btn-green',
					    	text : 'Continue',
					        action: function () {
					        	goToPage(login_page);
					        }
					    }
					    }
					    });	
				},
				error : function(data)
				{
					check_dialog.close();
				if(data.status == 401)
					{
					$.dialog({
						theme: 'modern',
		     		    type: 'red',
		    		    icon: 'fa fa-warning',
					    title: 'Verification Code Error!',
					    content: 'Code is wrong or expired!',
					});	
					}
				else if (data.status == 500)
					{
					$.dialog({
						theme: 'modern',
		     		    type: 'red',
		    		    icon: 'fa fa-warning',
					    title: 'Server Error!',
					    content: 'Please contact application\'s administrator!',
					});	
					}
				else if (data.status == 404)
					{
					$.confirm({
						closeIcon: false,
						theme: 'modern',
		     		    type: 'red',
		    		    icon: 'fa fa-warning',
					    title: 'Verification Code Error!',
					    content: 'Code Not Found!',
					    buttons: {
					    	btnok : {
					    	btnClass: 'btn-green',
					    	text : 'Back to Login Page',
					        action: function () {
					        	window.location.href = login_page;
					        }
					    }
					    }
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
    	 if($(input).val()== '')
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


function goToPage(page) {
	window.location.href = page;
}
