//Handle left
/*$('.left .person').mousedown(function(){
    if ($(this).hasClass('.active')) {
        return false;
    } else {
        var findChat = $(this).attr('data-chat');
        var personName = $(this).find('.name').text();
        $('.right .top .name').html(personName);
        $('.chat').removeClass('active-chat');
        $('.left .person').removeClass('active');
        $(this).addClass('active');
        $('.chat ').addClass('active-chat');
    }
});*/


var name; 
var targetUser;
var allowedUsers = [];
var login_page = "https://localhost:8443/CertificateServer/pages/login.html";
var contact_page = "https://localhost:8443/CertificateServer/pages/contact.html";

//************************************PARAMETRI DI INIZIALIZZAZIONE****************************************************
/* Questi parametri vengono passati dalla precedente pagina (contact.html)
 * attraverso un session storage, per poi essere eliminati subito dopo.
 * In particolare, conservare il parametro 'ruolo' può rappresentare una falla di sicurezza (escalation of privileges)
 * (per gli altri due parametri questo non si applica poichè 'list' corrisponde alla lista selezionata
 * dall'utente nella pagina 'contact.html', mentre 'utente' fa riferimento al suo username):
 * per questo motivo è necessario, server side, conservare (in una sessione => request.getSession(..)) il ruolo dell'utente
 * loggato, in modo che quando viene richiesta la lista con un certo ruolo (che potrebbe essere manomesso), lato server
 * (nella servlet per la contact list) vado prima a controllare l'uguaglianza tra il ruolo dell'utente che
 * ho server-side e quello che mi viene passato dal client.
 */

var storage = window.sessionStorage;
var list = storage.getItem("list");

var ruolo = storage.getItem("roleNumber");
var username = storage.getItem("username");
var nome = storage.getItem("name");
var cognome = storage.getItem("surname");


console.log("Lista richiesta:"+list);
console.log("Ruolo attuale:"+ruolo);
console.log("Nome utente attuale:"+nome);
console.log("Cognome utente attuale:"+cognome);

/*if(list == null || ruolo == null || nome == null || cognome == null || sessionStorage.getItem("token") == null){
	alert("Errore: lista, ruolo ed utente non selezionati.");
	window.location.href = "https://localhost:8443/CertificateServer/pages/login.html";
}*/


/* Nota: quando il client browser chiederà questa pagina, chiamerò un filtro lato server passandogli il token ricevuto
 * alla pagina precedente: questo filtro verificherà la validità del token, e se è corretto mi restituirà
 * la pagina originale, altrimenti mi riporterà al login.
 * Scenario di utilizzo:
 * Pagina 1 (ha gia il token come cookie) => Pagina 2
 * Quando dalla pagina 1 voglio andare alla pagina 2, faccio una richiesta 
 * verso la Pagina 2: questo attiverà il filtro lato server che verificherà il token (passato come cookie), e se il token è corretto
 * mi reindirizzerà alla Pagina 2 (allegando come cookie il nuovo token)
 *  
 */



//***************************************FINE PARAMETRI INIZIALIZZAZIONE**************************************************


//*********************************************CODICE UI-HANDLING*********************************************************




//Questi elementi vengono usati per simulare la procedura di login.
//In particolare, l'utente corrente è quello contenuto nel campo currentUserInput, dopodichè cliccando sul bottone
//currentUserBtn, l'info col nome utente scelto viene inviata al server (signaling, nodejs).
//Il server registra quest'informazione e la mantiene in modo da considerare l'utente
//in questione come "connesso".
//In particolare, in questa prima versione ci assicuriamo semplicemente che l'utente scelto non sia già presente
//tra quelli connessi, ma tale controllo è superfluo e viene automaticamente sostituito col login vero.

//window.onload = checkStorage;
/*
var contactsTable = document.querySelector('#contactsTable');
contactsTable.style.display = "none";

var currentUserInput = document.querySelector('#currentUserInput');
currentUserInput.value = nome+"_"+cognome+" ("+username+")";
currentUserInput.disabled = true;
var currentUser = document.querySelector('#currentUser');


var callPage = document.querySelector('#callPage'); 
callPage.style.display = "none";

var chatWith = document.querySelector('#textTitle');

var msgInput = document.querySelector('#msgInput'); 
var sendMsgBtn = document.querySelector('#sendMsgBtn'); 
var closeChatBtn = document.querySelector('#closeChatBtn'); 
var chatArea = document.querySelector('#chatarea'); 
var logoutBtn = document.querySelector('#logout');

logoutBtn.onclick = handleLogout;
*/
var currentUser;
var targetUser;
var currentUserInput;
var currentRole;
var login_page = "./login.html";

var storage = window.sessionStorage;
var targetName;
var targetRole;
var thereIsActiveChat;

var username = storage.getItem("username");
var nome = storage.getItem("name");
var cognome = storage.getItem("surname");
var ruolo = storage.getItem("roleNumber");
var ruoloNome = storage.getItem("role");
//var logoutBtn = document.querySelector('#logoutBtn');
//logoutBtn.onclick = handleLogout;

// Dialog Waiting Answer
var answered;
var offerAnswered;
var isrec_offline_offer; //Serve per evitare il doppio msg
var oneDone; //idem

var contactingDialog = $.dialog({
	closeIcon: false,
	theme: 'modern',
	    type: 'blue',
    icon: 'fa fa-spinner fa-spin',
    title: 'Waiting for Answer!',
    content: 'Contacting...!'
    });

$(document).ready(function() {
	contactingDialog.close();
	$('#right_panel').hide();
	var res = checkStorage();
	if(res){
		initTop();
		retrieveContactList();
	}else{
		var dialog = $.confirm({
			closeIcon: false,
			theme: 'modern',
			    type: 'red',
		    icon: 'fa fa-warning',
		    title: 'Wrong access attempt!',
		    content: 'You must Login first!',
		    buttons: {
		    	btnok : {
		    	btnClass: 'btn-red',
		    	text : 'Continue',
		        action: function () {
		        	dialog.close();
		        	window.location.href = login_page;
		        	}
		    	}
		    }
		    }); 
		console.log("Attenzione, e' necessario effettuare il login!");
	}
	
	
	
});


$('#logout_button').on('click',function(){
	var dialog = $.confirm({
		closeIcon: false,
		theme: 'modern',
		    type: 'orange',
	    icon: 'fa fa-warning',
	    title: 'Bye Bye!',
	    content: 'Click on Continue to Logout!',
	    buttons: {
	    	btnok : {
	    	btnClass: 'btn-orange',
	    	text : 'Continue',
	        action: function () {
	        	handleLogout();
	        	}
	    	},
			btnCancel : {
				btnClass: 'btn-green',
				text : 'Cancel',
				action: function () {
				dialog.close();
				}
			}
	    }
	    });
});

$('#close_button').on('click',function(){
	var dialog = $.confirm({
		closeIcon: false,
		theme: 'modern',
		    type: 'blue',
	    icon: 'fa fa-warning',
	    title: 'Are you sure?',
	    content: 'Click on Continue to close Chat!',
	    buttons: {
	    	btnok : {
	    	btnClass: 'btn-blue',
	    	text : 'Continue',
	        action: function () {
	        	dialog.close();

	        	send({ 
	                type: "close_chat", 
	                //sender: nome+"_"+cognome 
	                sender: username
	             });
	        	
	        	removeChat();
	        	handleLeave();
	        	}
	    	},
			btnCancel : {
				btnClass: 'btn-green',
				text : 'Cancel',
				action: function () {
				dialog.close();
				}
			}
	    }
	    });
});

/*$('window').on('pageshow', function(){
    checkStorage();
});*/

$(document).on("click", ".person", function(){
	if(!thereIsActiveChat){
	var chatter = document.getElementById("chat_to_top");
	chatter.textContent = "";
	var timeChat = document.getElementById("starting_chat");
	timeChat.textContent = "";
	$( "div" ).remove( ".bubble" );
	$('#right_panel').show();
	targetName = $(this).find('.name').text();
	targetRole = $(this).find('.role').text()
    startChat(targetName, targetRole);
    handleStartChat($(this).find('.username').text());
  	scrollUp();
	thereIsActiveChat = true;
	}else{
		var dialog = $.confirm({
			closeIcon: false,
			theme: 'modern',
			    type: 'orange',
		    icon: 'fa fa-warning',
		    title: 'Warning!',
		    content: 'You are currently enrolled in an active chat!',
		    buttons: {
		    	btnok : {
		    	btnClass: 'btn-orange',
		    	text : 'Continue',
		        action: function () {
		        	dialog.close();
		        	}
		    	}
		    }
		    });
	}
});

function initTop(){
	$('.contactName').text(nome+" "+cognome);
	$('.contactRole').text(translateRoleName(ruoloNome));
}

function translateRoleName(name){
	switch (name){
		case "tecnico": return "Technician";
		case "amministratore": return "Administrator";
		case "utente":return "User";
		default:return "undefined";
	} 
}

function addUserToList(name,role,user){
	var ul = document.getElementById("list");
	  var li = document.createElement("li");
	  li.className = "person";
	  var span_el = document.createElement("span");
	  span_el.className ="name";
	  span_el.textContent = name;
	  var role_el = document.createElement("span");
	  role_el.className ="role";
	  role_el.textContent = role;
	  var user_el = document.createElement("span");
	  user_el.className ="username";
	  user_el.textContent = user;
	  li.appendChild(span_el);
	  li.appendChild(role_el);
	  li.appendChild(user_el);
	  ul.appendChild(li);
	  $('.username').hide();
}

function startChat(name,role){
	var chatter = document.getElementById("chat_to_top");
	chatter.textContent = name;
	var chatter_role = document.getElementById("chat_to_top_role");
	chatter_role.textContent = " "+role;
	var timeChat = document.getElementById("starting_chat");
	var dt = new Date();
	var time = ("0"+dt.getHours()).slice(-2) + ":" +("0"+ dt.getMinutes()).slice(-2);
	timeChat.textContent = "Today, "+ time;
}


function removeChat(){
	var chatter = document.getElementById("chat_to_top");
	chatter.textContent = "";
	var timeChat = document.getElementById("starting_chat");
	timeChat.textContent = "";
	//$('.bubbe').hide();
	$( "div" ).remove( ".bubble" );
	$('#right_panel').hide();
}

function displaySentMessage(message){
	var mychatdiv = document.getElementById("chat_div");
	var newBubbleDiv = document.createElement("div");
	newBubbleDiv.className= "bubble me";
	newBubbleDiv.textContent = message;
	mychatdiv.appendChild(newBubbleDiv);
}

function displayReceivedMessage(message){
	var mychatdiv = document.getElementById("chat_div");
	var newBubbleDiv = document.createElement("div");
	newBubbleDiv.className= "bubble you";
	newBubbleDiv.textContent = message;
	mychatdiv.appendChild(newBubbleDiv);
}



$('#send_button').on("click",function(){
	if(jQuery.trim($('#inputText').val()).length > 0 ){
	dataChannel.send($('#inputText').val());
	displaySentMessage($('#inputText').val());
   scrollUp();
   $('#inputText').val('');
}
});

$(document).keypress(function(e) {
    if(e.which == 13 && jQuery.trim($('#inputText').val()).length > 0) {
    	dataChannel.send($('#inputText').val());
		displaySentMessage($('#inputText').val());
	  scrollUp();
      $('#inputText').val('');
    }

});

function scrollUp(){
	var objDiv = document.getElementById("chat_div");
	     objDiv.scrollTop = objDiv.scrollHeight;
}


/*//handler per il click sul bottone 'send message'
sendMsgBtn.addEventListener("click", function (event) { 
   var val = msgInput.value; 
   chatArea.innerHTML += "[Me]: " + val + "<br />"; 
	
   //invio messaggio
   dataChannel.send(val); 
   msgInput.value = ""; 
});



*/
//questa funzione gestisce il caso in cui viene cliccato il bottone "Contatta".
//In particolare, si occupa di aprire la chat col soggetto selezionato.
function handleStartChat(user){
	
	   
	   if(user == username){
		   //Se sono qui non sono tanto bravo
		   alert("Non puoi chattare con te stesso!");
	   }else{
		   //...se l'utente è diverso da me, procedo alla chiamata
		   startCall(user);  
	   }
	   
	
}


//funzione che si occupa di inviare l'utente selezionato nel box currentUserInput al server,
//per verificare se l'username in questione è stato già preso.
function handleCurrentUser(){
	
	var token = sessionStorage.getItem("token");
	
	if(checkStorage()){
	
	  send({ 
          type: "user_select", 
          name: username,
          token: token,
          roleNumber: ruolo
       });
	}
}




//Si occupa di recuperare e di generare la tabella dei contatti
//..in base alla lista richiesta e al ruolo settato nella pagina contacts (vedi parametri di inizializzazione)
//Se il permesso non viene accordato, restituisce un alert di permesso negato e rimanda alla pagina contacts
function retrieveContactList(){
	
	var token = sessionStorage.getItem("token");
	console.log("token trovato:"+token);
	
	var base_url = "https://localhost:8443/CertificateServer/contact-lists/";
	ruoli =["Administrator", "Technician", "User"];
	var url_list = [base_url+"admins/admin-list.xml",  base_url+"tecnici/tecnici-list.xml", base_url+"utenti/utenti-list.xml"];
	
	
	for(var k = 0; k < 3; k++) getListAJAX(k, url_list,ruoli,token);
		
}


function getListAJAX(k, url,ruoli,token){
	console.log("Chiamo AJAX");
	$.ajax({
	    type : "POST",
	    url : url[k],
	    dataType : "xml",
	    data : {
	    	list : k+1,
	        ruolo: ruolo,
	        token: token
	    },
	    
	    success : function(response, textStatus, xhr) {
	    	console.log("Ricevuta risposta per lista (Permesso accordato)!")
	    	console.log(response);
	        var xml = response.firstChild;
	        var xmlstring = xmlToString(xml);
	            
	        var x2js = new X2JS();
	        var jsonObj = x2js.xml_str2json(xmlstring);
	        var jsonString = JSON.stringify(jsonObj);
	        var json = JSON.parse(jsonString);
	          
	        var list = json.ContactList.Contact;
	        console.log(list);
	        
	        var col = [];
	        for (var i = 0; i < list.length; i++) {
	            for (var key in list[i]) {
	                if (col.indexOf(key) === -1) {
	                    col.push(key);
	                }
	            }
	        }
	        
	        for (var i = 0; i < list.length; i++) {

	            for (var j = 0; j < col.length; j++) {
	            	switch(j){
	            	case 0: var _username = list[i][col[j]];break; //username
	            	case 1: var nome = list[i][col[j]]; break;//nome
	            	case 2: var cognome = list[i][col[j]]; break; //cognome
	            	default: break;
	            	}
	            	
	            }
	            if(username != _username)
	            	addUserToList(nome+" "+cognome, ruoli[k],_username);
   
	        }
	     },
	    
	    error : function(request, textStatus, errorThrown) {
	    	
	    	console.log("errorThrown:"+errorThrown);
	    	console.log("textStatus:"+textStatus);
	    	console.log("statuscode:"+request.status);
	    	
	    	if(request.status == 401){
	    		
	    		console.log("User Requested: -"+k+"- Permesso negato!");
	    		//var token = sessionStorage.getItem("token");
	    		
	    		//redirectWithToken("./index_chat.html");
	    	}else if(request.status == 307){
	    		var dialog = $.confirm({
	    			closeIcon: false,
	    			theme: 'modern',
	    			    type: 'red',
	    		    icon: 'fa fa-warning',
	    		    title: 'Fatal - Token Expired!',
	    		    content: 'Click on Continue to LogOut!',
	    		    buttons: {
	    		    	btnok : {
	    		    	btnClass: 'btn-red',
	    		    	text : 'Continue',
	    		        action: function () {
	    		        	dialog.close();
	    		        	handleLogout();
	    		        	}
	    		    	}
	    		    }
	    		    });
	    	}else{
	    		var dialog = $.confirm({
	    			closeIcon: false,
	    			theme: 'modern',
	    			    type: 'red',
	    		    icon: 'fa fa-warning',
	    		    title: 'Server Communication Error!',
	    		    content: 'Click on Continue to LogOut!',
	    		    buttons: {
	    		    	btnok : {
	    		    	btnClass: 'btn-red',
	    		    	text : 'Continue',
	    		        action: function () {
	    		        	dialog.close();
	    		        	handleLogout();
	    		        	}
	    		    	}
	    		    }
	    		    });
	    	}
	    	
	    }
	});
}

//Funzione di utility, per convertire l'XML recuperato dal server in una stringa
//che verrà usata per popolare la tabella dei contatti
function xmlToString(xmlData) { 

    var xmlString;
    
    if (window.ActiveXObject){
        xmlString = xmlData.xml;
    }
    
    else{
        xmlString = (new XMLSerializer()).serializeToString(xmlData);
    }
    return xmlString;
} 


 

//*****************************************FINE FUNZIONI UI-HANDLING*************************************





//************************************************************CODICE WEBRTC*******************************************************************

/* Rappresentazione riassuntiva della procedura webRTC
 * 
 * Utente A vuole parlare con Utente B
 * 
 * Utente A si connette al signaling server, effettuando il login (sceglie semplicemente un username, vedi sopra)
 * Utente A riceve dal server un messaggio di OK (nessun utente ha quell'username, può procedere)
 * Utente A sceglie dalla tabella l'Utente B e clicca sul bottone 'Contatta'
 * Utente A crea un'offerta (sessione SDP) che manda al signaling server e setta la propria Local Peer Description con essa (configurazione locale)
 * Utente A setta un handler (onicecandidate) che viene chiamato ogniqualvolta sono disponibili nuovi ICE candidates
 * 	=> Nell'handler, l'Utente A invia all'Utente B i candidates, mediante signaling server
 * 	=> Quando l'utente B riceverà i candidates, li aggiungerà (metodo addicecandidate) alla sua remote peer description (per l'utente A)
 * Mediante il signaling server, se l'utente B è connesso, quest'ultimo riceverà l'offerta dell'Utente A
 * L'utente B setta la sua remote peer description per l'utente A in base alle informazioni ricevute (setta la configurazione dell'utente A)
 * L'utente B crea una risposta usando la propria local peer description (configurazione locale), e la setta 
 * L'utente B invia la risposta così fatta all'Utente A (mediante signaling server)
 * L'utente A riceve la risposta dell'utente B e setta la propria remote peer description per l'utente B
 * A questo punto i datachannel sono aperti, e l'utente A può contattare l'utente B * 
 * 
 */



var yourConn; 		//rappresenta la connessione con l'altro peer
var dataChannel;
var candidatesQueue = [];

//Connetto al signaling server mediante websocket
//var conn = new WebSocket('wss://localhost:9090'); 
var conn = new WebSocket("wss://localhost:12345");

conn.onopen = function () { 
   console.log("Connesso al signaling server");
   handleCurrentUser();
};
 
//Handler: quando riceviamo messaggi dal server..
conn.onmessage = function (msg) { 
   
   //I messaggi che riceveremo saranno sempre in formato JSON
   var data = JSON.parse(msg.data);   
	
   switch(data.type) { 
      
      //messaggio che viene restituito dal server dopo aver selezionato l'utente: ci dice se la selezione dell'utente
      //è andata a buon fine o meno
   	  case "user_select": 
         console.log("Ricevuto msg da server, selezione utente:",data.success);
         handleLogin(data.success);
         break; 
      
      //messaggio che viene mandato dal signaling server quando qualcuno vuole chiamarci 
      case "offer":
    	 console.log("Ricevuta offerta");
    	 handleOffer(data.offer, data.username, data.status, data.namesurname, data.role); 
         break; 
         
      //messaggio che riceviamo dal server quando vogliamo chiamare qualcuno: dopo avergli mandato la nostra offer
      //riceviamo la sua risposta (answer)
      case "answer": 
    	 console.log("Ricevuta answer");
    	 answered = true;
    	 handleAnswer(data.answer); 
         break; 
     
      //messaggio che riceviamo (non necessariamente dal server) quando ci viene inviato un nuovo ICE candidate
      case "candidate":
    	 console.log("Ricevuto: candidate da utente remoto");
    	 console.log(data);
         handleCandidate(data.candidate); 
         break; 
         
      //messaggio che riceviamo dal server e/o dall'utente interlocutore, che indica la chiusura della comunicazione
      case "close_chat":
    	  var dialog = $.confirm({
  			closeIcon: false,
  			theme: 'modern',
  			    type: 'blue',
  		    icon: 'fa fa-warning',
  		    title: 'End-User has closed Chat!',
  		    content: 'Click on Continue!',
  		    buttons: {
  		    	btnok : {
  		    	btnClass: 'btn-blue',
  		    	text : 'Continue',
  		        action: function () {
  		        	dialog.close();
  		        	removeChat();
  		        	 handleLeave();
  		        	}
  		    	}
  		    }
  		    });
  	
        
         break;
         
      case "new_token":
    	  console.log("Ricevuto newtoken");
    	  handleNewToken(data.newtoken);
    	  break;
    	  
      case "status_msg":
    	  console.log("Ricevuto status msg");
    	  handleStatus(data);
    	  break;
         
      //default
      default: 
         break; 
   } 
}; 

//In caso di errore nella connessione al signaling server
conn.onerror = function (err) { 
	var dialog = $.confirm({
		closeIcon: false,
		theme: 'modern',
		    type: 'red',
	    icon: 'fa fa-warning',
	    title: 'Signaling Server Error!',
	    content: 'Please contact the application\'s administrator!',
	    buttons: {
	    	btnok : {
	    	btnClass: 'btn-red',
	    	text : 'Continue',
	        action: function () {
	        	dialog.close();
	        	handleLogout();
	        	}
	    	}
	    }
	    });
}; 

//Funzione Helper per inviare messaggi in formato JSON al server 
function send(message) { 

   //alleghiamo il nome dell'utente interlocutore ai messaggi, se disponibile
   if (targetUser) { 
       
	   message.name = targetUser; 
   } 
   
   conn.send(JSON.stringify(message)); 
};
 


//Funzione chiamata non appena riceviamo un messaggio di tipo user_select da parte del server
//(in seguito a login)
function handleLogin(success) { 

   if (success === false) {
	   var dialog = $.confirm({
			closeIcon: false,
			theme: 'modern',
			    type: 'blue',
		    icon: 'fa fa-warning',
		    title: 'User Selection Error!',
		    content: 'Please, try another time!',
		    buttons: {
		    	btnok : {
		    	btnClass: 'btn-blue',
		    	text : 'Continue',
		        action: function () {
		        	dialog.close();
		        
		        	}
		    	}
		    }
		    });      
   } else { 
      
	   //currentUser.innerHTML = "<b>Utente selezionato: "+currentUserInput.value+"</b>";
	   
	   //contactsTable.style.display = "block";
       
	   setupInitialConnection();
      
		
   } 
};

function setupInitialConnection(){
	
	
	//Google public stun server 
    var configuration = { 
       "iceServers": [{ "url": "stun:stun2.1.google.com:19302" }] 
    }; 
		
    //Setup connessione (locale)
    yourConn = new RTCPeerConnection(configuration); 
		
    //Setup ice handling 
    yourConn.onicecandidate = function (event) { 
        
  	  if (event.candidate) { 
  		
          send({ 
             type: "candidate", 
             candidate: event.candidate,
             sender: username
         }); 
       } 
    };
    
    yourConn.ondatachannel = function(event) {
	     var receiveChannel = event.channel;
	     receiveChannel.onmessage = function(event) {
	    	displayReceivedMessage(event.data);
	    	scrollUp();
	    	console.log(event.data);
	     };
	  };     
		
	  //Apro data channel
	  openDataChannel();
	
}




//Creo ed apro il data channel
function openDataChannel() { 
   
   var dataChannelOptions = { 
      reliable:true 
   }; 
	
   dataChannel = yourConn.createDataChannel("myDataChannel", dataChannelOptions);
	
   dataChannel.onerror = function (error) { 
      console.log("DataChannel Error:", error); 
      var dialog = $.confirm({
			closeIcon: false,
			theme: 'modern',
			    type: 'red',
		    icon: 'fa fa-warning',
		    title: 'Cannot Open Data-Channel!',
		    content: 'Click on Continue to LogOut!',
		    buttons: {
		    	btnok : {
		    	btnClass: 'btn-red',
		    	text : 'Continue',
		        action: function () {
		        	dialog.close();
		        
		        	}
		    	}
		    }
		    });      
   };
	
 /* 
   dataChannel.onmessage = function (event) { 
			displayReceivedMessage(event.data);
	    	scrollUp();
	    	console.log("Data Channel: "+event.data);
   };  
 */  
   
}



//Funzione con cui avvio la chiamata verso un utente target
function startCall(target){
	var token = sessionStorage.getItem("token");
	contactingDialog.open();
	answered = false;
	console.log("Avvio chiamata verso:", target);
	targetUser = target;
	
	//creo una nuova offerta e la invio al signaling server
	yourConn.createOffer(function (offer) { 
        send({ 
           type: "offer", 
           offer: offer,
           sender: username,
           namesurname: nome+" "+cognome,
           sender_token: token,
           role: translateRoleName(ruoloNome)
        }); 
        //Setto la mia local peer description usando l'offerta che mando
        yourConn.setLocalDescription(offer); 
     }, function (error) { 
    	 
    	 var dialog = $.confirm({
 			closeIcon: false,
 			theme: 'modern',
 			    type: 'red',
 		    icon: 'fa fa-warning',
 		    title: 'Internal Error!',
 		    content: 'Please, try another time!',
 		    buttons: {
 		    	btnok : {
 		    	btnClass: 'btn-red',
 		    	text : 'Continue',
 		        action: function () {
 		        	dialog.close();
 		        
 		        	}
 		    	}
 		    }
 		    });      
    	 
       console.log("Errore creazione offerta");
        //var token = sessionStorage.getItem("token");
        
        //redirectWithToken("./index_chat.html");
        
     }); 
	
	   setTimeout(function(){ if(!answered) handleNoAnswer(); }, 10000);
}

 
//Funzione che gestisce il caso in cui riceviamo un offerta dal server.
//Questo può riguardare in particolare due casi:
//	se vogliamo chiamare un utente attualmente offline, ci verrà restituito (dal signaling server) un messaggio offer con stato OFFLINE
//	se qualche altro utente vuole chiamarci, riceveremo la sua offerta dal signaling server
function handleOffer(offer, user, status, namesurname, role) { 
	
	   targetUser = user;
	   targetName = namesurname;
	   targetRole = role;
	   offerAnswered = false;
	   
	   console.log("Ricevuta offerta da utente:"+user+" con status:"+status+",invio risposta all'offerta.");
	   console.log(offer);
	   yourConn.setRemoteDescription(new RTCSessionDescription(offer)); 

	   //ho ricevuto l'offerta dell'utente remoto, setto la sua remote peer description
	   var offerDialog = $.confirm({
			closeIcon: false,
			theme: 'modern',
			    type: 'blue',
		    icon: 'fa fa-spinner fa-spin',
		    title: 'Incoming Call..!',
		    content: targetName+' wants to talk with you!',
		    buttons: {
		    	btnok : {
		    	btnClass: 'btn-green',
		    	text : 'Accept',
		        action: function () {
		        	offerDialog.close();
		        	offerAnswered =true;
		        	thereIsActiveChat = true;
		        	replyToOffer(offer, user, status, namesurname, role);
		        	}
		    	},
				btnCancel : {
					btnClass: 'btn-red',
					text : 'Refuse',
					action: function () {
					offerDialog.close();
					offerAnswered = true;
					denyOffer(offer, user, status, namesurname, role);
					}
				}
		    }
		    });
	   
	   setTimeout(function(){ if(!offerAnswered) handleNoAnswerOnOffer(offerDialog); }, 10000);
	   
}


function handleNoAnswer(){
	contactingDialog.close();
	answered=true;
	thereIsActiveChat = false;
	var dialog = $.confirm({
		closeIcon: false,
		theme: 'modern',
		    type: 'orange',
	    icon: 'fa fa-warning',
	    title: 'Timeout!',
	    content: 'Request timed out!',
	    buttons: {
	    	btnok : {
	    	btnClass: 'btn-orange',
	    	text : 'Continue',
	        action: function () {
	        	dialog.close();
	        	removeChat();
	        	handleLeave();
	        	}
	    	}
	    }
	    }); 
}

function handleNoAnswerOnOffer(offerDialog){
	offerDialog.close();
	offerAnswered = true;
	thereIsActiveChat = false;
	var dialog = $.confirm({
		closeIcon: false,
		theme: 'modern',
		    type: 'orange',
	    icon: 'fa fa-warning',
	    title: 'Timeout!',
	    content: 'Your request has not received response!',
	    buttons: {
	    	btnok : {
	    	btnClass: 'btn-orange',
	    	text : 'Continue',
	        action: function () {
	        	dialog.close();
	        	}
	    	}
	    }
	    }); 
}

function denyOffer(){
	var token = sessionStorage.getItem("token");

	    
	   //creo la mia risposta, che tramite il signaling server sarà inviata all'utente che mi ha chiamato
	   //inoltre, setto anche la mia local peer description con l'answer che invierò all'utente remoto
	   yourConn.createAnswer(function (answer) { 
	      yourConn.setLocalDescription(answer); 
	      send({ 
	         type: "answer", 
	         answer: answer,
	         sender: username,
	         sender_token : token,
	         deny: true
	      }); 
	   }, function (error) { 
		   var dialog = $.confirm({
				closeIcon: false,
				theme: 'modern',
				    type: 'red',
			    icon: 'fa fa-warning',
			    title: 'Communication Error!',
			    content: 'Please, try again!',
			    buttons: {
			    	btnok : {
			    	btnClass: 'btn-red',
			    	text : 'Continue',
			        action: function () {
			        	dialog.close();
			        	removeChat();
			        	}
			    	}
			    }
			    });      
	   });
	   
}

function handleDeny(){
	thereIsActiveChat = false;
	contactingDialog.close();
	removeChat();
	handleLeave();
}

function handleOnAnswerOffline(){
	thereIsActiveChat = false;
	oneDone=true;
	removeChat();
	handleLeave();
	var dialog = $.dialog({
		theme: 'modern',
		    type: 'red',
	    icon: 'fa fa-warning',
	    title: 'Communication Error!',
	    content: 'End-point user has been offline!'
	    });      
	oneDone=false;
}


function replyToOffer(offer, user, status, namesurname, role){	 
	
	   

	   var token = sessionStorage.getItem("token");
	   
	   //setto i candidates, se necessario
	   if(candidatesQueue.length > 0){
			
			for(var i = 0;i<candidatesQueue.length;i++){
				yourConn.addIceCandidate(new RTCIceCandidate(candidatesQueue.shift()));
			}
		}
		$('#right_panel').show();
		console.log("Chat Starting with "+targetName+","+targetRole);
	    startChat(targetName, targetRole);
	  	scrollUp();
		
	   //creo la mia risposta, che tramite il signaling server sarà inviata all'utente che mi ha chiamato
	   //inoltre, setto anche la mia local peer description con l'answer che invierò all'utente remoto
	   yourConn.createAnswer(function (answer) { 
	      yourConn.setLocalDescription(answer); 
	      send({ 
	         type: "answer", 
	         answer: answer,
	         sender: username,
	         sender_token:  token,
	         name : nome+" "+cognome
	      }); 
	   }, function (error) { 
		   var dialog = $.confirm({
				closeIcon: false,
				theme: 'modern',
				    type: 'red',
			    icon: 'fa fa-warning',
			    title: 'Communication Error or End-Point Disconnected!',
			    content: 'Please, try again!',
			    buttons: {
			    	btnok : {
			    	btnClass: 'btn-red',
			    	text : 'Continue',
			        action: function () {
			        	dialog.close();
			        	removeChat();
			        	}
			    	}
			    }
			    });      
	   });
	   
}
 

//Quando un utente remoto ci risponde (perchè lo vogliamo chiamare)
function handleAnswer(answer) {
	
	contactingDialog.close();
	$('#right_panel').show();
    startChat(targetName,targetRole);
  	scrollUp();
	    //setto la remote peer description per l'utente remoto
		yourConn.setRemoteDescription(new RTCSessionDescription(answer));
		
		if(candidatesQueue.length > 0){
			for(var i = 0;i<candidatesQueue.length;i++){
				yourConn.addIceCandidate(new RTCIceCandidate(candidatesQueue.shift()));
			}
		
	}
};
 
//quando ricevo un ICE candidate da un utente remoto
function handleCandidate(candidate) { 
  

	if(!yourConn || !yourConn.remoteDescription.type){
		console.log("Non ho ancora remote description, accodo il candidate");
		candidatesQueue.push(candidate);
	}else{
		 console.log("Ho già la remote description, procedo ad aggiungere i candidates");
		 yourConn.addIceCandidate(new RTCIceCandidate(candidate)); 
	}
	
	
  
};
 

//funzione per gestire la chiusura della connessione
function handleLeave() { 
   
   console.log("Chiusura chat con "+targetUser);
   targetUser = null; 
   yourConn.close(); 
   yourConn.onicecandidate = null; 
   setupInitialConnection();
   thereIsActiveChat = false;

};


function handleNewToken(token){
	
	
	if(token != null){
		sessionStorage.removeItem("token");
		sessionStorage.setItem("token", token);
	}else{
		console.log("Nuovo token null, mantengo quello vecchio.");
	}
	
	
	
}


function handleLogout(){
	
	
	
	
	//var token = sessionStorage.getItem("token");
	console.log("Richiedo logout..");
	
	thereIsActiveChat = false;
	
	//inviando msg logout, tolgo l'utente dai logged users (lato server)
	/*send({ 
        type: "logout", 
        sender: username,
        token:  token
     }); */
	
	//cambiando pagina , distruggo automaticamente la connessione (rimuovendo utente dai connectedusers lato server)
	window.location.href = login_page;
}



function handleStatus(data){
	console.log(data);;
	var status = data.status;
	
	switch(status){
	
	case "no_sender":
		console.log("Mittente non trovato, redirect al login!");
		var dialog = $.confirm({
			closeIcon: false,
			theme: 'modern',
			    type: 'red',
		    icon: 'fa fa-warning',
		    title: 'Communication Error!',
		    content: 'No sender found!',
		    buttons: {
		    	btnok : {
		    	btnClass: 'btn-red',
		    	text : 'Continue',
		        action: function () {
		        	dialog.close();
		        	handleLogout();
		        	}
		    	}
		    }
		    });  
		break;		
	
	case "rec_offline_offer":
		isrec_offline_offer = true;
		contactingDialog.close();
		answered = true;
		var dialog = $.confirm({
			closeIcon: false,
			theme: 'modern',
			    type: 'blue',
		    icon: 'fa fa-warning',
		    title: 'Selected user is Offline!',
		    content: 'Please try again or choose another one!',
		    buttons: {
		    	btnok : {
		    	btnClass: 'btn-blue',
		    	text : 'Continue',
		        action: function () {
		        	dialog.close();
		        	thereIsActiveChat = false;
		        	removeChat();
		        	isrec_offline_offer=false;
		        	}
		    	}
		    }
		    }); 
		console.log("Impossibile contattare l'utente offline: "+data.name+", riprova!");
		break;
		
	case "rec_offline":
		if(!isrec_offline_offer && !oneDone){
			handleOnAnswerOffline();
		console.log("Impossibile contattare l'utente offline: "+data.name+", riprova!");
		}
		break;
		
	case "rec_denied":
		answered = true;
		var dialog = $.confirm({
			closeIcon: false,
			theme: 'modern',
			    type: 'red',
		    icon: 'fa fa-warning',
		    title: 'Access Denied!',
		    content: 'Please contact the administrator!',
		    buttons: {
		    	btnok : {
		    	btnClass: 'btn-red',
		    	text : 'Continue',
		        action: function () {
		        	dialog.close();
		        	}
		    	}
		    }
		    }); 
		console.log("Permesso negato per le comunicazioni con utente:"+data.name+", riprova!");
		break;
		
	case "token_expired":
		console.log("Token utente scaduto, redirect al login!");
		var dialog = $.confirm({
			closeIcon: false,
			theme: 'modern',
			    type: 'red',
		    icon: 'fa fa-warning',
		    title: 'Oooops!',
		    content: 'Your token is expired!',
		    buttons: {
		    	btnok : {
		    	btnClass: 'btn-red',
		    	text : 'Logout',
		        action: function () {
		        	dialog.close();
		        	handleLogout();
		        	}
		    	}
		    }
		    }); 
		break;
		
		
	case "no_answer":
		answered = true;
		var dialog = $.confirm({
			closeIcon: false,
			theme: 'modern',
			    type: 'red',
		    icon: 'fa fa-warning',
		    title: 'Communication Error!',
		    content: 'No Answer Received!',
		    buttons: {
		    	btnok : {
		    	btnClass: 'btn-red',
		    	text : 'Continue',
		        action: function () {
		        	dialog.close();
		        	removeChat();
		        	}
		    	}
		    }
		    }); 
		console.log("Errore nella ricezione risposta da parte dell'utente: "+data.name+", riprova!");
		//var token = sessionStorage.getItem("token");
	    //window.location.href = contact_page;
		//redirectWithToken("./index_chat.html");
		break;
		
	case "failed_login":
		var dialog = $.confirm({
			closeIcon: false,
			theme: 'modern',
			    type: 'orange',
		    icon: 'fa fa-warning',
		    title: 'Login Error!',
		    content: 'You have more than one active session!',
		    buttons: {
		    	btnok : {
		    	btnClass: 'btn-orange',
		    	text : 'Logout',
		        action: function () {
		        	dialog.close();
		        	handleLogout();
		        	}
		    	}
		    }
		    }); 
		console.log("Attenzione: accesso alle chat fallito. Se hai piu' di una sessione attiva, chiudi le altre prima di continuare.");
		//window.location.href = login_page;
		break;
		
	case "rec_busy":
		answered=true;
		contactingDialog.close();
		var dialog = $.confirm({
			closeIcon: false,
			theme: 'modern',
			    type: 'blue',
		    icon: 'fa fa-warning',
		    title: 'User Busy!',
		    content: 'Selected user is now busy, please try again!',
		    buttons: {
		    	btnok : {
		    	btnClass: 'btn-blue',
		    	text : 'Continue',
		        action: function () {
		        	removeChat();
		        	thereIsActiveChat = false;
		        	dialog.close();
		        	}
		    	}
		    }
		    }); 
		console.log("Attenzione: l'utente "+data.name+" e' attualmente impegnato in un'altra sessione, riprovare piu' tardi.");
		break;
		
	case "error":
		var dialog = $.confirm({
			closeIcon: false,
			theme: 'modern',
			    type: 'red',
		    icon: 'fa fa-warning',
		    title: 'Communication Error!',
		    content: 'Generic Error!',
		    buttons: {
		    	btnok : {
		    	btnClass: 'btn-red',
		    	text : 'Logout',
		        action: function () {
		        	dialog.close();
		    	
		        	handleLogout();
		        	}
		    	}
		    }
		    }); 
		console.log("Errore di comunicazione, ritorno al login!");
		break;
		
		
		
		
	case "denied_chat":
		answered = true;
		var dialog = $.confirm({
			closeIcon: false,
			theme: 'modern',
			    type: 'blue',
		    icon: 'fa fa-warning',
		    title: 'Call Rejected!',
		    content: 'Your request has been declined!',
		    buttons: {
		    	btnok : {
		    	btnClass: 'btn-blue',
		    	text : 'Continue',
		        action: function () {
		        	dialog.close();
		    	    
		    		handleDeny();
		        	}
		    	}
		    }
		    }); 
		break;
		
		
		
		
	case "expired_session":
		
		var dialog = $.confirm({
			closeIcon: false,
			theme: 'modern',
			    type: 'red',
		    icon: 'fa fa-warning',
		    title: 'Session Expired!',
		    content: 'You were inactive for too long!',
		    buttons: {
		    	btnok : {
		    	btnClass: 'btn-red',
		    	text : 'Back to Login',
		        action: function () {
		        	dialog.close();
		    	
		        	handleLogout();
		        	}
		    	}
		    }
		    }); 
		console.log("Session Expired!!!");
		break;
		
		
	default:
		console.log("Errore: status_msg non riconosciuto");
		handleLogout();
		break;
	}
	
	
	
	
	
	
	
}
/*
function redirectWithToken(page){

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

function checkStorageEmpty ()
{console.log("Check empty storage..");
console.log(sessionStorage.getItem("token") == "");
if (sessionStorage.getItem("token") == ""
        || sessionStorage.getItem("name") == ""
        || sessionStorage.getItem("surname") == ""
        || sessionStorage.getItem("role") == ""
        || sessionStorage.getItem("roleNumber") == ""
        || sessionStorage.getItem("telephone") == ""
        || sessionStorage.getItem("list") == "") {
    console.log("Empty!");
	return true;
}else{
    return false;	
}

}



function checkStorageNull()
{	console.log("Check null storage..");
    if (sessionStorage.getItem("token") == null
            || sessionStorage.getItem("name") == null
            || sessionStorage.getItem("surname") == null
            || sessionStorage.getItem("role") == null
            || sessionStorage.getItem("roleNumber") == null
            || sessionStorage.getItem("telephone") == null) {
    	console.log("Null storage!");
        return true;
    }else{
    	return false;
    }
    

}


function checkStorage(){
	
	if(!checkStorageNull() && !checkStorageEmpty()){
		console.log("Trovati tutti i parametri!");
		return true;
	}else{
		return false;
		/*var dialog = $.confirm({
			closeIcon: false,
			theme: 'modern',
			    type: 'red',
		    icon: 'fa fa-warning',
		    title: 'Furbacchione!',
		    content: 'You must Login First!',
		    buttons: {
		    	btnok : {
		    	btnClass: 'btn-red',
		    	text : 'Continue',
		        action: function () {
		        	dialog.close();
		        	window.location.href = login_page;
		        	}
		    	}
		    }
		    }); 
		console.log("Attenzione, e' necessario effettuare il login!");*/
		//window.location.href = login_page;
	}	
}


//****************************************************FINE CODICE WEBRTC********************************************************











