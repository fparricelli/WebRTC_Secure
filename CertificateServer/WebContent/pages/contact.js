var contactAdmin = document.querySelector('#contactAdminBtn'); 
var contactTechnician = document.querySelector('#contactTechnicianBtn'); 
var contactUser = document.querySelector('#contactUserBtn'); 
var currentUserInput = document.querySelector('#currentUserInput');
var currentRole = document.querySelector('#currentRole');
var login_page = "./login.html";
var logoutBtn = document.querySelector('#logoutBtn');

contactUser.onclick = handleUserClick;
contactAdmin.onclick = handleAdminClick;
contactTechnician.onclick = handleTechClick;
logoutBtn.onclick = handleLogout;



$(document).ready(
        function() {
            checkStorage()
        });
        
        $(window).on('pageshow', function(){
            checkStorage()
        });



function checkStorageEmpty ()
{console.log("Chiamata a subroutine");
console.log(sessionStorage.getItem("token") == "");
if (sessionStorage.getItem("token") == ""
        || sessionStorage.getItem("name") == ""
        || sessionStorage.getItem("surname") == ""
        || sessionStorage.getItem("role") == ""
        || sessionStorage.getItem("roleNumber") == ""
        || sessionStorage.getItem("telephone") == "") {
    window.location.href = login_page;
    }}



function checkStorageNull()
{
    if (sessionStorage.getItem("token") == null
            || sessionStorage.getItem("name") == null
            || sessionStorage.getItem("surname") == null
            || sessionStorage.getItem("role") == null
            || sessionStorage.getItem("roleNumber") == null
            || sessionStorage.getItem("telephone") == null) {
        window.location.href = login_page;
}}

    function checkStorage()
    {
        checkStorageEmpty();
        checkStorageNull();
    }

currentUserInput.value = sessionStorage.getItem("name")+" "+sessionStorage.getItem("surname");
currentUserInput.disabled = true;

currentRole.value = sessionStorage.getItem("role")+" "+sessionStorage.getItem("roleNumber");
currentRole.disabled = true;


function handleAdminClick() {
	console.log("Richiedo lista admin con utente: "+currentUserInput.value+", ruolo: "+currentRole.value);
	sessionStorage.setItem("list",1);
	//var token = sessionStorage.getItem("token");
	window.location.href = "https://localhost:8443/CertificateServer/pages/index_chat.html";
	//redirectWithToken("./index_chat.html");
}

function handleTechClick() {
	console.log("Richiedo lista tecnici con utente: "+currentUserInput.value+", ruolo: "+currentRole.value);
	sessionStorage.setItem("list",2);
	//var token = sessionStorage.getItem("token");
	window.location.href = "https://localhost:8443/CertificateServer/pages/index_chat.html";
	//redirectWithToken("./index_chat.html");
}

function handleUserClick() {
	console.log("Richiedo lista utenti con utente: "+currentUserInput.value+", ruolo: "+currentRole.value);
	sessionStorage.setItem("list",3);
	//var token = sessionStorage.getItem("token");
	window.location.href = "https://localhost:8443/CertificateServer/pages/index_chat.html";
	//redirectWithToken("./index_chat.html");
}

function handleLogout(){
	
	var token = sessionStorage.getItem("token");
	var username = sessionStorage.getItem("username");
	
	console.log("Richiedo logout..");
	
	var msg = { 
	        type: "logout", 
	        sender: username,
	        token:  token
	     };
	
	var conn = new WebSocket("wss://localhost:12345");
	
	conn.onopen = function () { 
		conn.send(JSON.stringify(msg)); 
		alert("Clicca su OK per effettuare il logout..");
		window.location.href = "./login.html";
	};
	
	
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

}*/


