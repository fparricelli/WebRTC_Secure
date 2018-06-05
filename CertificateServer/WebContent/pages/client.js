



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

window.onload = checkStorage;

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

//handler per il click sul bottone 'send message'
sendMsgBtn.addEventListener("click", function (event) { 
   var val = msgInput.value; 
   chatArea.innerHTML += "[Me]: " + val + "<br />"; 
	
   //invio messaggio
   dataChannel.send(val); 
   msgInput.value = ""; 
});


//handler per il bottone 'chiudi chat'
closeChatBtn.addEventListener("click", function(event){
	
	send({ 
        type: "close_chat", 
        //sender: nome+"_"+cognome 
        sender: username
     });
	
	handleLeave();
	
});


//questa funzione gestisce il caso in cui viene cliccato il bottone "Contatta".
//In particolare, si occupa di aprire la chat col soggetto selezionato.
function handleContactButton(){
	
	   //Vado a recuperare, dalla tabella, il nome del contatto in corrispondenza del bottone
	   //che è stato cliccato
	   var oRows = document.getElementById("contactsTable").getElementsByTagName('tr');
	   var iRowCount = oRows.length;
	   var oTable = document.getElementById("contactsTable");
	   var rows = oTable.getElementsByTagName('tr');
	   
	   var e = window.event,
       btn = e.target || e.srcElement;
	   
	   var targetUsername;
	   
	   for(var i = 1; i < iRowCount; i++ ){
		   
		   if(btn.id == "btn_"+i){
			   console.log("Vuoi parlare con:",rows[i].cells[0].innerHTML);
			   targetUsername = rows[i].cells[0].innerHTML;
		   }
		}
	   if(targetUsername.toLowerCase() == username){
		   alert("Non puoi chattare con te stesso!");
	   }else{
		   
		   //...se l'utente è diverso da me, procedo alla chiamata
		   startCall(targetUsername);  
	   }
	   
	
}




//funzione che si occupa di inviare l'utente selezionato nel box currentUserInput al server,
//per verificare se l'username in questione è stato già preso.
//Anche questa, col login implementato, verrà rimossa.
function handleCurrentUser(){
	
	var token = sessionStorage.getItem("token");
	
	  send({ 
          type: "user_select", 
          //name: nome+"_"+cognome,
          name: username,
          token: token,
          roleNumber: ruolo
       });
}




//Si occupa di recuperare e di generare la tabella dei contatti
//..in base alla lista richiesta e al ruolo settato nella pagina contacts (vedi parametri di inizializzazione)
//Se il permesso non viene accordato, restituisce un alert di permesso negato e rimanda alla pagina contacts
function retrieveContactList(){
	
	var token = sessionStorage.getItem("token");
	console.log("token trovato:"+token);
	
	var base_url = "https://localhost:8443/CertificateServer/contact-lists/";
	var c_url = "";
	
	if(list == 1){
		c_url = base_url+"admins/admin-list.xml";
	}else if(list == 2){
		c_url = base_url+"tecnici/tecnici-list.xml";
	}else{
		c_url = base_url+"utenti/utenti-list.xml";
	}

	 
$.ajax({
    type : "POST",
    url : c_url,
    dataType : "xml",
    data : {
    	list : list,
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
        
        
        
        loadTable(list);
    
     },
    
    error : function(request, textStatus, errorThrown) {
    	
    	console.log("errorThrown:"+errorThrown);
    	console.log("textStatus:"+textStatus);
    	console.log("statuscode:"+request.status);
    	
    	if(request.status == 401){
    		
    		alert("Permesso negato!");
    		//var token = sessionStorage.getItem("token");
    		window.location.href = contact_page;
    		//redirectWithToken("./index_chat.html");
    	}else if(request.status == 307){
    		alert("Token scaduto!");
    		handleLogout();
    	}else{
    		alert("Errore di comunicazione con il server, riprova.");
    		handleLogout();
    	}
    	
    }
});
	
	
}


//Funzione di GUI handling puro, carica la lista ottenuta dal server(in formato JSON) nella tabella
function loadTable(list){
	
	var col = [];
    for (var i = 0; i < list.length; i++) {
        for (var key in list[i]) {
            if (col.indexOf(key) === -1) {
                col.push(key);
            }
        }
    }
    
    col[col.length] = "Contatta";
    
    var table = document.createElement("table");
    
    var tr = table.insertRow(-1);  
    
    for (var i = 0; i < col.length; i++) {
        var th = document.createElement("th");      
        th.innerHTML = col[i];
        tr.appendChild(th);
    }
    
    for (var i = 0; i < list.length; i++) {

        tr = table.insertRow(-1);

        for (var j = 0; j < col.length; j++) {
            var tabCell = tr.insertCell(-1);
            
            if(j == 0){
            	allowedUsers.push(list[i][col[j]]);
            }       
            
            
            if(j == col.length-1){
            	var btn = document.createElement('input');
            	btn.id = "btn_"+(i+1);
            	btn.type = "button";
            	btn.className = "btn";
            	btn.value = "Contatta";
            	btn.onclick = function() { handleContactButton(); }
            	tabCell.appendChild(btn);
            }else{
            	tabCell.innerHTML = list[i][col[j]];
            }
            
            
        }
    }
    console.log("Allowed:"+allowedUsers);
    var divContainer = document.getElementById("contactsTable");
    divContainer.innerHTML = "";
    divContainer.appendChild(table);	
    	
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
    	 handleOffer(data.offer, data.name+" "+data.surname, data.status, data.role); 
         break; 
         
      //messaggio che riceviamo dal server quando vogliamo chiamare qualcuno: dopo avergli mandato la nostra offer
      //riceviamo la sua risposta (answer)
      case "answer": 
    	 console.log("Ricevuta answer");
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
         handleLeave(); 
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
   alert("Errore di comunicazione, riprova.");
   console.log("Errore:", err);
   window.location.href = contact_page;
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
      alert("Selezione utente fallita, riprova con un altro username."); 
      
   } else { 
      
	   currentUser.innerHTML = "<b>Utente selezionato: "+currentUserInput.value+"</b>";
	   
	   contactsTable.style.display = "block";
       
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
	    	chatArea.innerHTML += "["+targetUser+"]: " + event.data + "<br />"; 
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
      alert("Errore di comunicazione, riprova.");
      //var token = sessionStorage.getItem("token");
      window.location.href = contact_page;
      //redirectWithToken("./index_chat.html");
   };
	
   dataChannel.onmessage = function (event) { 
	   chatArea.innerHTML += "[" +targetUser+"]: " + event.data + "<br />"; 
	   console.log(event.data);
   };  
   
   
}



//Funzione con cui avvio la chiamata verso un utente target
function startCall(target){
	var token = sessionStorage.getItem("token");
	
	console.log("Avvio chiamata verso:", target);
	
	targetUser = target;
	
	//creo una nuova offerta e la invio al signaling server
	yourConn.createOffer(function (offer) { 
        send({ 
           type: "offer", 
           offer: offer,
           sender: username,
           sender_token: token
        }); 
        //Setto la mia local peer description usando l'offerta che mando
        yourConn.setLocalDescription(offer); 
     }, function (error) { 
    	 
        alert("Errore nella creazione dell'offerta."); 
        //var token = sessionStorage.getItem("token");
        window.location.href = contact_page;
        //redirectWithToken("./index_chat.html");
        
     }); 
	
	
}

 
//Funzione che gestisce il caso in cui riceviamo un offerta dal server.
//Questo può riguardare in particolare due casi:
//	se vogliamo chiamare un utente attualmente offline, ci verrà restituito (dal signaling server) un messaggio offer con stato OFFLINE
//	se qualche altro utente vuole chiamarci, riceveremo la sua offerta dal signaling server
function handleOffer(offer, name, status,role) { 
   
	   var token = sessionStorage.getItem("token");
	
	   targetUser = name;
	   console.log("Ricevuta offerta da utente:"+name+" con status:"+status+",invio risposta all'offerta.");
	   
	   //ho ricevuto l'offerta dell'utente remoto, setto la sua remote peer description
	   yourConn.setRemoteDescription(new RTCSessionDescription(offer)); 
	   
	   //setto i candidates, se necessario
	   if(candidatesQueue.length > 0){
			
			for(var i = 0;i<candidatesQueue.length;i++){
				yourConn.addIceCandidate(new RTCIceCandidate(candidatesQueue.shift()));
			}
		}
	   
	   //mostro la chat area
	   if(callPage.style.display == "none"){
		  chatWith.innerHTML = "<b>Chatti con: "+targetUser+"</b>";
		  callPage.style.display = "block";
	   }
		
	   //creo la mia risposta, che tramite il signaling server sarà inviata all'utente che mi ha chiamato
	   //inoltre, setto anche la mia local peer description con l'answer che invierò all'utente remoto
	   yourConn.createAnswer(function (answer) { 
	      yourConn.setLocalDescription(answer); 
	      send({ 
	         type: "answer", 
	         answer: answer,
	         sender: username,
	         sender_token:  token
	      }); 
	   }, function (error) { 
	      alert("Errore di comunicazione, riprova."); 
	      //var token = sessionStorage.getItem("token");
	      window.location.href = contact_page;
	     // redirectWithToken("./index_chat.html");
	      
	      
	   });
	   
   
  
	
};
 

//Quando un utente remoto ci risponde (perchè lo vogliamo chiamare)
function handleAnswer (answer) {
	
	
		//Mostro la chat area
		if(callPage.style.display == "none"){
			 callPage.style.display = "block";
			 chatWith.innerHTML = "<b>Chatti con: "+targetUser+"</b>";
		   }
		
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
   callPage.style.display = "none";
   targetUser = null; 
   yourConn.close(); 
   yourConn.onicecandidate = null; 
   setupInitialConnection();
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
	
	var token = sessionStorage.getItem("token");
	
	console.log("Richiedo logout..");
	
	//inviando msg logout, tolgo l'utente dai logged users (lato server)
	send({ 
        type: "logout", 
        sender: username,
        token:  token
     }); 
	
	//cambiando pagina , distruggo automaticamente la connessione (rimuovendo utente dai connectedusers lato server)
	window.location.href = login_page;
}



function handleStatus(data){
	
	var status = data.status;
	
	switch(status){
	
	case "no_sender":
		alert("Mittente non trovato, redirect al login!");
		handleLogout();
		break;		
	
	case "rec_offline":
		alert("Impossibile contattare l'utente offline: "+data.name+", riprova!");
		break;
		
	case "rec_denied":
		alert("Permesso negato per le comunicazioni con utente:"+data.name+", riprova!");
		break;
		
	case "token_expired":
		alert("Token utente scaduto, redirect al login!");
		handleLogout();
		break;
		
		
	case "no_answer":
		alert("Errore nella ricezione risposta da parte dell'utente: "+data.name+", riprova!");
		//var token = sessionStorage.getItem("token");
	    window.location.href = contact_page;
		//redirectWithToken("./index_chat.html");
		break;
		
	case "failed_login":
		alert("Attenzione: accesso alle chat fallito. Se hai piu' di una sessione attiva, chiudi le altre prima di continuare.");
		window.location.href = login_page;
		break;
		
	case "rec_busy":
		alert("Attenzione: l'utente "+data.name+" e' attualmente impegnato in un'altra sessione, riprovare piu' tardi.");
		break;
		
	case "error":
		alert("Errore di comunicazione, ritorno al login!");
		handleLogout();
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
            || sessionStorage.getItem("telephone") == null
            || sessionStorage.getItem("list") == null) {
    	console.log("Null storage!");
        return true;
    }else{
    	return false;
    }
    

}


function checkStorage(){
	
	if(!checkStorageNull() && !checkStorageEmpty()){
		console.log("Trovati tutti i parametri!");
		retrieveContactList();
	}else{
		alert("Attenzione, e' necessario effettuare il login!");
		window.location.href = login_page;
	}	
}


//****************************************************FINE CODICE WEBRTC********************************************************











