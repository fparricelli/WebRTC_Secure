/***************************************************CODICE SERVER NODEJS***********************************************************
 * Il codice implementa un semplice signaling server WEBRTC.
 * Il server non fa altro che fare da intermediario tra i due peer comunicanti, permettendogli di scambiare offer/answer ed
 * i relativi ICE candidates.
 * Tale server è pensato per essere 'accoppiato' al tomcat server principale che si occupa di concretizzare tutte le misure
 * di sicurezza previste (autenticazione, autorizzazione, ecc)
 * Sono state introdotte delle minime funzionalità di sicurezza (tra cui: controllo sul login mediante comunicazione
 * con il server tomcat, controllo dei permessi all'atto dell'invio offer-answer) che verranno ulteriormente 
 * dettagliate e commentate.  
 * 
 */

const httpServ = require('https');
const fs = require('fs');
const crypto = require('crypto')
var constants = require('./constants.js');
var utilities = require('./utilities.js');
var user_utilities = require('./user_utilities.js');
var WebSocketServer = require('ws').Server;
var loggedUser = require('./loggedUser.js');


var ws_cfg = {
		  ssl: true,
		  port: constants.server_port,
		  ssl_key: constants.ssl_key_path,
		  ssl_cert: constants.ssl_cer_path
		};


//SSL Setup
var app = httpServ.createServer({
  key: fs.readFileSync(ws_cfg.ssl_key),
  cert: fs.readFileSync(ws_cfg.ssl_cert)
}, processRequest).listen(ws_cfg.port);

var processRequest = function(req, res) {
    console.log("HTTPS Request received.")
};

//Avvio WebSocketServer
var wss = new WebSocketServer( {server: app});


var loggedUsers = [];
var connectedUsers = {};
  


//Callback chiamata all'apertura di una nuova connessione (websocket) da parte di un endpoint remoto
wss.on('connection', function(connection) {
  
   console.log("[ON-OPEN] Utente connesso.");	 
   
   
   //Callback chiamata ogni volta che si riceve un messaggio da parte di un endpoint remoto
   connection.on('message', async function(message) {
	 
      var data; 
      
      //Accettiamo solo messaggi in formato JSON
      try { 
         data = JSON.parse(message); 
      } catch (e) { 
         console.log("Invalid JSON"); 
         data = {}; 
      }

      //In base al tipo di messaggio ricevuto...
      switch (data.type) { 
     
      
      /****************************************************** TOMCAT MESSAGE *************************************************** 
       * Il messaggio con type : tomcat_msg ha il seguente formato (JSON)
       * 
       * {
       * 	type : tomcat_msg
       * 	name : <username>
       * 	token : <user_token>
       * 	roleNumber : <user_rolenumber>
       * 	hash : <file_hash>
       * }
       * 
       * Quando un utente effettua il login, verrà autenticato dal server Tomcat.
       * Se l'autenticazione va a buon fine, il server tomcat si occuperà di aprire una websocket
       * verso il server nodejs e mandargli un messaggio, per segnalare l'utente appena loggato (assieme alle sue informazioni,
       * vale a dire username, token di accesso e role number).
       * Il messaggio inviato da tomcat conterrà inoltre l'hash di un file (secure_key.txt) disponibile SOLO al server tomcat
       * e al server nodeJS, contenente una chiave generata randomicamente (aggiornata periodicamente ogni 30 minuti).
       * In questo modo, quando il server nodeJS riceverà il messaggio da tomcat contenente le informazioni sull'utente
       * loggato, effettuerà l'hash dello stesso file (secure_key.txt) e se gli hash corrispondono, potrà procedere
       * all'aggiunta dell'utente specificato alla lista loggedUsers.
       * In questo modo si evita che un qualsiasi utente esterno apra una connessione websocket verso il server nodeJS
       * e gli invii messaggi di login per un utente che non ha prima effettuato il login presso il server tomcat.
       * Inoltre, visto che ammettiamo un client single-chat, se un utente dovesse effettuare nuovamente il login (lato tomcat)
       * quest'ultimo invierebbe un nuovo messaggio al server nodeJS che segnalerebbe il login di quell'utente: il server nodeJS però
       * controllerà nella lista degli utenti loggati (loggedUsers), e se trova un utente già presente, non lo aggiungerà alla lista.
       * 
       * 
       */
      
       case "tomcat_msg":
    	  
    	  console.log("[TOMCAT-MSG] Ricevo da tomcat :", data); 
    	  
    	  //Calcolo hash del file
    	  var hash = await utilities.fileHash();							
    	  
    	  console.log("[TOMCAT-MSG] Hash calcolato:"+hash);
    	  console.log("[TOMCAT-MSG] Hash ricevuto:"+data.hash);
    	  
    	  //Controllo validità dell'hash..
    	  if(hash != data.hash){
    		  
    		  //In caso di check fallito, invio un messaggio di failed_login
    		  console.log("[TOMCAT-MSG] Hash check fallito, non loggo!");
    		  
    		  sendTo(connection, { 
                  type: "status_msg", 
                  status: "failed_login"
               }); 
    		 
    	  //Se invece l'hash check è riuscito, posso aggiungere l'utente tra i logged users
    	  }else{
    		  
    		  console.log("[TOMCAT-MSG] Hash check riuscito!");
    		  
    		  /*    		  var user = {
    				  name: data.name,
    				  token: data.token,
    				  roleNumber: data.roleNumber  				 
    		  }*/
    		  
    		  var user = new loggedUser();
    		  user.setName(data.name);
    		  user.setToken(data.token);
    		  user.setRoleNumber(data.roleNumber);
    		  
    		  //Prima di aggiungere l'utente tra i logged users, controllo che non vi sia già presente
    		  var p = user_utilities.findLoggedUserByName(data.name, loggedUsers);
    		  
    		  //Se non trovo l'utente tra i loggedUsers, lo aggiungo
    		  if(p == -1){
    			  console.log("[TOMCAT-MSG] Utente "+data.name+" non trovato tra i logged users, aggiungo.");
    			  loggedUsers.push(user);
    		  
    		  //Se invece l'utente è già presente nei loggedUsers, non lo aggiungo ma ne rinnovo il token di accesso (se necessario)
    		  }else{
    			  
    			  console.log("[TOMCAT-MSG] Utente "+data.name+" già presente tra i logged users, non aggiungo!");
    			  var new_token = data.token;
    			  var old_token = loggedUsers[p].getToken();
    			 
    			  if(old_token != new_token){
    				  console.log("[TOMCAT-MSG] Aggiorno token!");
    				  loggedUsers[p].setToken(new_token);
    			  }
    		  }
    		  
    		  console.log("[TOMCAT-MSG] Ci sono: "+loggedUsers.length+" utenti loggati.");
    		  console.log("[TOMCAT-MSG] lista:");
    		  console.log(loggedUsers);
    		  
    	}
    	  
    	  
    	break;
    	
    	/************************************************* USER SELECT MESSAGE ************************************************** 
    	 * Dopo che l'utente è stato loggato e autenticato dal server tomcat (con tutta la procedura vista sopra)
    	 * esso si connetterà al server nodeJS per avviare la chat, aprendo una websocket verso di esso (all'apertura della main page).
    	 * Nel farlo, invierà un messaggio user_select (JSON) con le seguenti informazioni:
    	 * 
    	 * {
         * 		type: user_select
         * 		name : <username>		
         * 		roleNumber : <rolenumber>
         *  	token : <token>
         * }
         * 
         * 
    	 * A questo punto il server nodeJS si occuperà semplicemente di verificare che le info utente contenute nel messaggio
    	 * siano effettivamente corrispondenti ad un utente già loggato (ovvero presente all'interno dei loggedUsers).
    	 * Se l'utente contenuto nel messaggio non è presente nei loggedUsers significa che un utente vuole accedere
    	 * al server nodeJS senza prima essere passato per l'autenticazione lato tomcat, quindi in tal caso rimandiamo al login.
    	 * In caso contrario, ovvero: l'utente specificato nel messaggio è presente tra i loggedUsers
    	 * , allora tale utente verrà inserito tra i connectedUsers (connesso al signaling server). 
    	 * 
    	 */
    	
       case "user_select":
        	 
        
           console.log("[USER-SELECT] Ricevo le seguenti informazioni utente:", data); 
           console.log("[USER-SELECT] Ho:"+loggedUsers.length+" utenti loggati!");
           
           //Cerco l'utente specificato tra gli utenti loggati
           var find = user_utilities.findUser(data, loggedUsers);
           
           //Se la ricerca non va a buon fine, significa che qualcuno vuole accedere al signaling server
           //senza prima essere passato per l'autenticazione lato tomcat: rimanderemo indietro un messaggio failed_login
           if(find == -1){
        	   console.log("[USER-SELECT] Utente non trovato tra gli utenti loggati!");	
        	   
        	   sendTo(connection, { 
                   type: "status_msg", 
                   status: "failed_login"
                });         	   
        	
           //Se l'utente specificato è stato trovato tra i loggedUsers, allora posso procedere
           }else{
        	   
        	   //Qui, controllo che l'utente specificato non sia già presente tra i connectedUsers (per evitare di duplicarlo)

        	   console.log("[USER-SELECT] Trovato utente loggato!");
        	   var u = user_utilities.findConnectedUserByName(data.name, connectedUsers);
        	   
        	   
        	   //Se l'utente non è presente tra i connectedUsers, posso aggiungerlo
        	   if(u == -1){
        		   console.log("[USER-SELECT] Utente "+data.name+" non trovato tra i connectedUsers, procedo");
        		   
        		   /* Qui sfruttiamo il mapping nativo chiave-valore disponibile in nodeJS per memorizzare 
        		    * l'oggetto connection che ci servirà per gestire le comunicazioni con l'utente.
        		    * La struttura che utilizziamo è così fatta:
        		    * 	
        		    * 	chiave : <username>
        		    * 	valore <connection_obj>
        		    * 			attributi valore:
        		    * 			name => username
        		    * 			token => user token
        		    * 			roleNumber => user role Number
        		    * 			last activity => last user activity
        		    * 			otherName => <username> => username dell'end-user con cui siamo in chat
        		    * 
        		    * per ciascuno degli utenti connessi, conserveremo una entry di questo tipo nella lista connectedUsers.
        		    * Si nota inoltre la presenza di un attributo last_activity, che memorizza l'ultima attività dell'utente
        		    * (login / invio answer / invio offer) in modo da permettere di fare il logout automatico dopo un certo 
        		    * periodo di inattività (descritto dopo).
        		    * 
        		    */			
        		   
        		   //Memorizzo le informazioni
        		   connectedUsers[data.name] = connection;            	   
            	   connectedUsers[data.name].token = data.token;
            	   connectedUsers[data.name].roleNumber = data.roleNumber;
            	   connectedUsers[data.name].name = data.name;
            	   connectedUsers[data.name].last_activity = new Date();
            	   
            	   //Notifico l'utente che il login è avvenuto correttamente
            	   sendTo(connection, { 
                       type: "user_select", 
                       success: true 
                    }); 
            	   
            	   console.log("[USER-SELECT] UTENTI CONNESSI:");
            	   console.log(connectedUsers);
            	 
               //Se l'utente specificato è già presente tra i connectedUsers, mando un messaggio: failed_login
        	   }else{
        		   
        		   console.log("[USER-SELECT] Utente "+data.name+" già trovato tra gli utenti connessi!");        		   
        		   
        		   sendTo(connection, { 
                       type: "status_msg", 
                       status: "failed_login"
                   }); 
        		   
        		   
        	   }
        	   
           }
           
         break;
         
         
         /**************************************************** OFFER MESSAGE **************************************************************** 
          * Il messaggio offer viene inviato da un utente A che vuole parlare con un utente B, per effettuare il setup della connessione RTC.
          * Esso è così strutturato:
          * {
          * 	type : "offer"
          * 	offer : <offer_> (sdp)
          * 	sender : <sender_username> => username di A
          * 	name : <receiver_username> => username di B
          * 	namesurname : nome e cognome di A
          * 	sender_token : sender access token (token di A)
          * 	role : sender role number (ruolo di A)
          * }
          * 
          * Il server nodeJS, alla ricezione di tale messaggio, si occuperà di:
          * - verificare che l'utente A sia loggato e connesso (ovvero: presente tra loggedUsers e connectedUsers)
          * - verificare che l'utente B sia loggato e connesso (ovvero: presente tra loggedUsers e connectedUsers)
          * - verificare che l'access token di A sia valido
          * - verificare che A abbia il permesso di parlare con B (contattando il server tomcat e usando policy XACML)
          * - verificare che B non sia già impegnato in un'altra chat
          * 
          * Nel caso in cui una di queste condizioni non dovesse verificarsi, l'utente A sarà opportunamente
          * avvertito con messaggi di stato.
		  *
          * Possibile scenario: A invia offerta a B
    	  * A invia messaggio "offer" al server nodeJS
    	  * Il server:
    	  * 	=>verifica se A è presente tra gli utenti loggati/connessi
    	  * 		=>in caso contrario, invia all'utente A messaggio: no_sender (che rimanda al login)
    	  * 		=>in caso affermativo, verifica se l'utente B è presente tra gli utenti loggati/connessi
    	  * 			=>in caso contrario, invia all'utente A messaggio: offline (B è offline)
    	  * 			=>in caso affermativo (B online) il server procede a verificare che A abbia i permessi per parlare con B e che abbia il token valido
    	  * 				=>se A può parlare con B e il suo token è OK, invia a B messaggio: offer, e invia token rinnovato ad utente A (controllando che B non sia già impegnato in un'altra chat)
    	  * 				=>se A non può parlare con B (permesso negato/B impegnato) ma il suo token è OK, invia ad A messaggio: permesso negato/B impegnato + token rinnovato
    	  * 				=>se il token di A è scaduto, invio ad A messaggio: token expired (che rimanda al login)
    	  * 				=>in caso di server error, mando ad A messaggio: error (rimanda al login)
    	  */
            
         case "offer":
        	 
        	 console.log("[OFFER] Ricevuta offerta da parte di:"+data.sender);
        	 console.log("[OFFER] Tentativo di invio offerta a:"+data.name);

        	 //verifico che il sender sia tra gli utenti loggati/connessi
        	 var sender_ok = user_utilities.checkUserPresence(data.sender, loggedUsers, connectedUsers);        	
        	 
        	 if(!sender_ok){
        		 
        		 //Mittente non trovato
        		 console.log("[OFFER] Sender non trovato!");
        		 sendTo(connection, { 
                     type: "status_msg", 
                     name: data.name,
                     status: "no_sender"
                  });
        		
        	 //Mittente trovato
        	 }else{
        		 
        		 console.log("[OFFER] Sender trovato!");
        		 
        		 //verifico che il destinatario sia tra gli utenti loggati/connessi
        		 var rec_ok = user_utilities.checkUserPresence(data.name, loggedUsers, connectedUsers);
        		 
        		 //Destinatario offline
        		 if(!rec_ok){
        			 
        			 console.log("[OFFER] Destinatario non trovato!");
        			 
        			 sendTo(connection, { 
                         type: "status_msg", 
                         name: data.name,
                         status: "rec_offline_offer"
                      });
        			 
        			
        		 //Sender e destinatario online
        		 }else{
        			 
        			 console.log("[OFFER] Sender e Destinatario online!");
        			 
        			 //sender e destinatario trovati
        			 
        			 //Recupero sender e destinatario (dai connectedUsers)
        			 var sender = user_utilities.findConnectedUserByName(data.sender, connectedUsers);
        			 var rec = user_utilities.findConnectedUserByName(data.name, connectedUsers);        			 
        			
        			
        			 console.log("[OFFER] Found sender name:"+sender.name);
        			 console.log("[OFFER] Found sender token:"+sender.token);
        			 console.log("[OFFER] Found sender rolenumber:"+sender.roleNumber);
        			 console.log("[OFFER] Il token inviato dal sender è:"+data.sender_token);
        			 
        			 console.log("[OFFER] Found rec name:"+rec.name);
        			 console.log("[OFFER] Found rec token:"+rec.token);
        			 console.log("[OFFER] Found rec rolenumber:"+rec.roleNumber);
        			 
        			 var role_send = sender.roleNumber;
        			 var list = rec.roleNumber; 
        			 
        			 //verifico i permessi: sender può parlare con receiver?
        			 var res = await user_utilities.checkUserToken(data.sender_token, list, role_send);
        			 
        			 //Permesso accordato: posso continuare
        			 if(res.result == constants.PERMIT){
        				 
        				 console.log("[OFFER] Permesso accordato, posso inviare offerta.");
        				 
        				 //Invio nuovo token all'utente sender (rigenerato)
        				 sendTo(connection, { 
        	                    type: "new_token", 
        	                    newtoken: res.newtoken
        	                 });
        				 
        				 //Aggiorno nuovo token per utente sender (nei connectedUsers)
        				 connectedUsers[data.sender].token = res.newtoken;
        				 
        				 //Aggiorno nuovo token per utente sender (nei loggedUsers)
        				 var lp = user_utilities.findLoggedUserByName(data.sender, loggedUsers);
        				 loggedUsers[lp].setToken(res.newtoken);
        				 
        				 //Aggiorno last_activity per il sender (per evitare inactivity timeout)
        				 connectedUsers[data.sender].last_activity = new Date();
        				 
        				 console.log("[OFFER] Nuovo token aggiornato per utente "+data.sender);
        				 
        				 //Procedo all'invio dell'offer al receiver ma solo se non è già impegnato in un'altra conversazione
        				
        				 if(connectedUsers[data.name].otherName != null){
        					 
            				 console.log("[OFFER] Utente destinatario "+data.name+" già impegnato!");
            				 
            				 //Se il destinatario è impegnato, segnalo la cosa con un messaggio status
            				 sendTo(connection, { 
         	                    type: "status_msg", 
         	                    name: data.name,
         	                    status: "rec_busy"
         	                 });
            				
            			 //Se invece il destinatario non è impegnato, posso procedere ad inviare l'offerta
            			 }else{
        				 
            				 //Invio offerta all'utente receiver
            				 	sendTo(rec, { 
            				 			type: "offer", 
            				 			offer: data.offer, 
            				 			namesurname: data.namesurname,
            				 			username: data.sender,
            				 			status: "online",
            				 			role: data.role
            				 		}); 
        				
            			 }
        				
        				 
        			 //Permesso negato: il sender non può comunicare col receiver!
        			 }else if(res.result == constants.DENY){
        				 
        				 console.log("[OFFER] Permesso negato per l'utente: "+data.sender);
        				 
        				//Invio comunque nuovo token all'utente sender
        				 sendTo(connection, { 
        	                    type: "new_token", 
        	                    newtoken: res.newtoken
        	                 });
        				 
        				//Aggiorno nuovo token per l'utente sender (nei connectedUsers)
        				 connectedUsers[data.sender].token = res.newtoken;
        				 console.log("[OFFER] nuovo token aggiornato per utente:"+data.sender);  
        				 
        				//Aggiorno nuovo token per utente sender (nei loggedUsers)
        				 var lp = user_utilities.findLoggedUserByName(data.sender, loggedUsers);
        				 loggedUsers[lp].setToken(res.newtoken);
        				 
        				 //Invio al sender un messaggio di permesso negato
        				 sendTo(connection, { 
                             type: "status_msg", 
                             name: data.name,
                             status: "rec_denied"
                          });
        				 
        				 
        			 //Il token fornito dall'utente è scaduto: in questo caso, lato client avviene un redirect
        			 //immediato al login
        			 }else if(res.result == constants.TOKEN_EXPIRED){
        				 
        				 console.log("[OFFER] Token Expired per utente:"+data.sender);
        				 
        				 //gli invio messaggio di token-expired (che rimanderà al login)
        				 sendTo(connection, { 
                             type: "status_msg", 
                             name: data.name,
                             status: "token_expired"
                          });        			 
        			 
        			 //Tutti gli altri casi individuano un errore nella richiesta di permit-check fatta verso il server	 
        			 }else{
        				 
        				 console.log("[OFFER] Errore!");
        				 
        				 //Invio messaggio di errore al client (sender)
        				 sendTo(connection, { 
                             type: "status_msg", 
                             name: data.name,
                             status: "error"
                          });
        				 
        			}
        			 
        		 }
        		 
        	  }
        	 
        break;		
        
        /******************************************************* ANSWER MESSAGE *********************************************************
         * Il messaggio "answer" viene inviato ogniqualvolta un utente B (che ha ricevuto un messaggio offer da parte di un utente A)
         * vuole rispondere a quest'ultimo per completare il setup della connessione RTC.
         * Il messaggio answer è così strutturato (JSON):
         * 
         * {
         * 		type : "answer"
         * 		answer : <answer_> (sdp)
         * 		sender : <username_> (username di B)
         * 		name : <rec_username> (username di A)
         * 		sender_token : <token_> (token di B)
         * }
         * 
         * Ogniqualvolta il server nodeJS riceve un messaggio di answer da parte di un utente B (indirizzato verso un utente A) si occupa di:
         * 
         * - verificare che l'utente A sia loggato e connesso (ovvero: presente tra loggedUsers e connectedUsers)
         * - verificare che l'utente B sia loggato e connesso (ovvero: presente tra loggedUsers e connectedUsers)
         * - verificare che l'access token di B sia valido
         * - verificare che l'utente B non abbia rifiutato di rispondere (in altri termini: se A chiama B, B può decidere di non rispondere)
         * - verificare che A abbia il permesso di parlare con B (contattando il server tomcat e usando policy XACML)
         * 
         * 
         * Scenario di utilizzo:
         * A invia offer a B; 
         * B deve rispondere ad A (B invia answer ad A)
         * Il server:
         * 	=> verifica se B è tra gli utenti loggati/connessi
         * 		=> in caso contrario: rimando al login 
         * 		=> in caso affermativo, verifico se A è presente tra gli utenti loggati/connessi
         * 			=> in caso contrario, avviso l'utente B 
         * 			=> in caso affermativo, verifico se B ha rifiutato di rispondere ad A, nel qual caso avviso l'utente A
         * 			=> successivamente, verifico se A può parlare con B e se il token di B è valido
         * 				=> se il token di B è valido, invio nuovo token a B, setto nuova connessione tra A e B e invio answer ad A
         * 				=> altrimenti, in caso di errore o token expired, rimando al login (per B) e invio messaggio no_answer ad A
         * 
         */
         
         case "answer": 
        	 
        	 
        	 console.log("[ANSWER] Ricevuta answer da:"+data.sender);
        	 console.log("[ANSWER] Tento di inviare risposta a:"+data.name);
        	 
        	 
        	 //Controllo se il sender è presente tra gli utenti loggati e connessi
        	 var sender_ok = user_utilities.checkUserPresence(data.sender, loggedUsers, connectedUsers);
        	 
        	 
        	 if(!sender_ok){
        		 
        		 //Sender non presente
        		 console.log("[ANSWER] Sender non trovato!");
        		 
        		 sendTo(connection, { 
                     type: "status_msg", 
                     name: data.name,
                     status: "no_sender"
                  });
        		 
        	 }else{
        		 
        		 //Sender presente, controllo presenza del destinatario
        		 console.log("[ANSWER] Sender trovato!");
        		 
        		 var rec_ok = user_utilities.checkUserPresence(data.name, loggedUsers, connectedUsers);
        		 
        		 //Destinatario non trovato
        		 if(!rec_ok){
        			 
        			 console.log("[ANSWER] Destinatario non trovato!")
        			 
        			 sendTo(connection, { 
                         type: "status_msg", 
                         name: data.name,
                         status: "rec_offline"
                      });
        			 
        			 
        		 }else{
        			 
        			 //Sender e receiver trovati, posso procedere
        			 console.log("[ANSWER] Sender e Destinatario online!");
        			 
        			 var sender = user_utilities.findConnectedUserByName(data.sender, connectedUsers);
        			 var rec = user_utilities.findConnectedUserByName(data.name, connectedUsers);
        			 
        			 
        			 //Controllo se il sender (cioè: chi deve rispondere) ha rifiutato di rispondere
        			 //In tal caso avverto il ricevente (colui che ha inviato offer) della cosa
        			 if(data.deny){
        				 console.log("[ANSWER] Ricevuta answer con deny:"+data.sender+" non vuole parlare con "+data.name);
        				 
        				 sendTo(rec, { 
       	                  	type: "status_msg", 
       	                  	status: "denied_chat"
       	               }); 
        			
        			 //Se il sender non ha rifiutato di rispondere..	 
        			 }else{
        			 
        			 
        				 console.log("[ANSWER] sender name:"+sender.name);
        				 console.log("[ANSWER] sender token:"+sender.token);
        				 console.log("[ANSWER] sender rolenumber:"+sender.roleNumber);
        				 console.log("[ANSWER] Il token inviato dal sender è:"+data.sender_token);

        				 console.log("[ANSWER] rec name:"+rec.name);
        				 console.log("[ANSWER] rec token:"+rec.token);
        				 console.log("[ANSWER] rec rolenumber:"+rec.roleNumber);
        			 
        				 var role_send = sender.roleNumber;
        				 var list = rec.roleNumber;
        			 
        			 //Verifico i permessi per sender e receiver
        			 
        			 /*
        			  * Qui controllo i permessi (ripetendo quanto fatto nel caso dell'offer)
        			  * Il motivo principale per cui chiamo la checkUserToken è per rinnovare il token dell'utente
        			  * che sta rispondendo: i permessi legati al fatto che chi ha inviato l'offer poteva farlo
        			  * sono stati già verificati in fase di invio dell'offer
        			  * (Se sto rispondendo, vuol dire che chi mi ha inviato l'offerta aveva i permessi per farlo)
        			  */
        			 
        				 var res = await user_utilities.checkUserToken(data.sender_token, list, role_send);
        			 
        				 //Quando arrivo qui, i permessi saranno stati già verificati in fase di invio offer
        				 if(res.result == constants.PERMIT || res.result == constants.DENY){
        				 
        					 console.log("[ANSWER] invio nuovo token all'utente "+data.sender);
        				 
        					 //Invio nuovo token all'utente sender
        					 sendTo(connection, { 
        						 type: "new_token", 
        						 newtoken: res.newtoken
        	                 	});
        				 
        					 //aggiorno nuovo token per utente sender (nei connectedUsers)
        					 connectedUsers[data.sender].token = res.newtoken;
        				 
        					 //Aggiorno nuovo token per utente receiver (nei loggedUsers)
        					 var lp = user_utilities.findLoggedUserByName(data.sender, loggedUsers);
        					 loggedUsers[lp].setToken(res.newtoken);
        				 
        				 
        					 //Aggiorno last_activity per evitare il session timeout
        					 connectedUsers[data.sender].last_activity = new Date();
        				 
        					 console.log("[ANSWER] utente:"+data.sender);
        					 console.log("[ANSWER] nuovo token aggiornato per utente:"+data.sender);
        				 
        					 //Setto nuova connessione per l'utente sender
        					 connectedUsers[data.sender].otherName = data.name;
        				 
        					 //Setto nuova connessione per l'utente receiver
        					 connectedUsers[data.name].otherName = data.sender;
        				 
        					 console.log("[ANSWER] utente "+data.sender+" connesso con:"+connectedUsers[data.sender].otherName);
        					 console.log("[ANSWER] utente "+data.name+" connesso con:"+connectedUsers[data.name].otherName);
        				 
        					 //Invio la risposta al destinatario
        	             
        					 sendTo(rec, { 
        						 type: "answer", 
        						 answer: data.answer,
        	                 	 name : data.name,
        	                 	 role : data.role,
        	                 	 deny: data.deny
        					 }); 
        				 
        				 }else{
        				 
        					//In tal caso: si è verificato un TOKEN_EXPIRED per l'utente sender (colui che deve rispondere) 
        					 //oppure un Server Error
        				 
        					 //Notifico con un no_answer colui che aspettava la answer
        					 console.log("[ANSWER] invio no_answer ad utente:"+data.name);
        				 
        					 sendTo(rec, { 
        						 type: "status_msg",
        						 name: data.sender,
        						 status: "no_answer"
        					 }); 
        				 
        					 //Se si è verificato un token_expired, avverto l'utente sender (colui che deve rispondere)
        					 //con un messaggio token_expired..
        					 if(res.result == constants.TOKEN_EXPIRED){
        						 console.log("[ANSWER] Token Expired per utente:"+data.sender);
        						 
        						 sendTo(connection, { 
        							 type: "status_msg",
        							 name: data.name,
        							 status: "token_expired"
        						 });       					 
        					 
        					 }else{
        					 
        						//...altrimenti con un messaggio di server error
        						 console.log("[ANSWER] Errore!");
        						 
        						 sendTo(connection, { 
        							 type: "status_msg",
        							 name: data.name,
        							 status: "error"
          	                	});
        					 }
        				 
        				 }
        			 
        			 }
        		 
        		 }        		 
         
        	 }
        	 
        break;
        	 
        /************************************************* CANDIDATE MESSAGE *******************************************************
         * Il messaggio candidate è strutturato nel seguente modo:
         * 
         * {
         * 		type : "candidate"
         * 		candidate : <ice-candidate>
         * 		sender : <username sender>
         * 		name : <username receiver>
         * }
         * 
         * Si tratta di un messaggio che viene scambiato tra il mittente ed il ricevente per settare i relativi ICE candidates.
         * I controlli che vengono effettuati sono simili a quelli effettuati in precedenza, in particolare
         * andiamo a verificare che sender e receiver siano presenti tra i loggedUsers e i connectedUsers prima di procedere.         * 
         * 
         */
        
         case "candidate":
        	 console.log("[CANDIDATES] Invio candidates da "+data.sender+" verso "+data.name);
        	 
        	 //Verifico la presenza dell'utente sender
        	 var sender_ok = user_utilities.checkUserPresence(data.sender, loggedUsers, connectedUsers);
        	 
        	 //Sender non trovato
        	 if(!sender_ok){
        		 console.log("[CANDIDATES] Sender non trovato!");
        		 
        		 sendTo(connection, { 
                     type: "status_msg", 
                     name: data.name,
                     status: "no_sender"
                  });      		 
        		 
        	 //Sender trovato
        	 }else{
        		 console.log("[CANDIDATES] Sender trovato!");
        		 
        		 //Verifico la presenza del destinatario
        		 var rec_ok = user_utilities.checkUserPresence(data.name, loggedUsers, connectedUsers);  
        		 
        		 //Destinatario non trovato
        		 if(!rec_ok){
        			 console.log("[CANDIDATES] Destinatario non trovato!");
        			 
        			 sendTo(connection, { 
                         type: "status_msg", 
                         name: data.name,
                         status: "rec_offline"
                      });
        			
        			 
        		 }else{
        			 
        			 //Sender e destinatario presenti, posso procedere
        			 console.log("[CANDIDATES] Destinatario trovato!");
        			 
        			 
        			 var rec = user_utilities.findConnectedUserByName(data.name, connectedUsers);
        			 console.log("[CANDIDATES] Procedo ad invio candidates..");
        			 
        			
        				 sendTo(rec, { 
        					 type: "candidate", 
        					 candidate: data.candidate 
        				 }); 
        			 
        		}
        	 }
        	 
        	 
          break; 
          
          
          
          /************************************************* CLOSE CHAT MESSAGE **************************************************
           * Il messaggio di close_chat viene inviato ogniqualvolta uno tra mittente e destinatario decidere di chiudere la chat.
           * Il messaggio è così strutturato:
           * {
           * 	type : "close_chat"
           * 	sender : <sender_username>
           * 	name : <receiver_username>
           * }
           * 
           * I controlli che facciamo qui sono gli stessi visti prima: controlliamo che sender e receiver siano loggati/connessi;
           * Inoltre, in tal caso verifichiamo che effettivamente mittente e destinatario siano connessi tra loro prima di
           * andare a chiudere la relativa chat.
           * 
           * 
           */
              
         case "close_chat":
        	 
        	 console.log("Richiesta di chiusura chat da parte di "+data.sender+" per la chat con "+data.name);
        	 
        	 //Verifico che il mittente sia presente tra gli utenti loggati/connessi
        	 var sender_ok = user_utilities.checkUserPresence(data.sender, loggedUsers, connectedUsers);
        	 
        	 //Sender non trovato
        	 if(!sender_ok){
        		 console.log("[CLOSE] Sender non trovato!");
        		 
        		 sendTo(connection, { 
                     type: "status_msg", 
                     name: data.name,
                     status: "no_sender"
                  });      		 
        		 
        	 }else{
        		 
        		 //Sender trovato
        		 console.log("[CLOSE] Sender trovato!");
        		 var rec_ok = user_utilities.checkUserPresence(data.name, loggedUsers, connectedUsers);  
        		 
        		 if(!rec_ok){
        			 
        			 //Destinatario non trovato
        			 console.log("[CLOSE] Destinatario non trovato!");
        			 
        			 sendTo(connection, { 
                         type: "status_msg", 
                         name: data.name,
                         status: "rec_offline"
                      });
        			 
        		 }else{
        			 
        			 //Sender e destinatario trovati
        			 console.log("[CLOSE] Destinatario trovato!");
        			 
        			 //recupero sender e destinatario
        			 var sender = user_utilities.findConnectedUserByName(data.sender, connectedUsers);
        			 var rec = user_utilities.findConnectedUserByName(data.name, connectedUsers);
        			 
        			 console.log("[CLOSE] utente"+data.sender+" è connesso con:"+connectedUsers[data.sender].otherName);
        			 
        			 //Verifico che sender e destinatario siano effettivamente connessi in chat
        			 if(connectedUsers[data.sender].otherName != data.name || connectedUsers[data.name].otherName != data.sender){
        				 
        				 
        				 console.log("[CLOSE] Chat con utente "+data.name+" non trovata, non posso chiuderla!");
        				 
        				 //Se non lo sono, invio un messaggio di errore all'utente che ha richiesto il closechat
        				 sendTo(connection, { 
                             type: "status_msg", 
                             name: data.name,
                             status: "error"
                          });
        				 
        			 }else{
        				 
        				 //Se la chat viene trovata, provvedo a ripulire i campi otherName per mittente e destinatario
        				 
        				 console.log("[CLOSE] Chat trovata, procedo alla chiusura.");
        				 connectedUsers[data.sender].otherName = null;
        				 connectedUsers[data.name].otherName = null;
        				 
        				 //Avverto il destinatario che il mittente ha richiesto la chiusura della chat
        				 sendTo(rec, { 
                             type: "close_chat", 
                         });
        				 
        			 }
        			 
        		 }
        	 }
         
         break;
         
         
        //In caso di comando non riconosciuto..
         default:
			 
        	console.log("[DEFAULT] COMANDO NON RICONOSCIUTO");
         	console.log(data);
            sendTo(connection, { 
               type: "status_msg", 
               status: "error"
            }); 
				
            break;
				
      }  
   });
	
   /****************************************** CONNECTION-CLOSE ********************************************************
    * Ogniqualvolta un utente lascia la finestra di chat (la chiude, va indietro, la refresha, ecc) viene attivata
    * la callback "onclose" per la websocket che è stata settata con quell'utente.
    * In questo caso, andiamo a (con riferimento all'utente che ha chiuso la connessione):
    * 	- recuperare il connectedUser dai connectedUsers
    * 	- recuperare il loggedUser dai loggedUsers
    * 	- eliminare l'utente dai loggedUsers
    * 	- prima di eliminare l'utente (A) dai connectedUsers, verifico se c'è una chat attiva con qualche altro utente (B)
    * 	e vado ad aggiornare lo stato della chat per l'altro utente (B) prima di eliminare il primo (A).
    * 	- 
    * 
    */
   connection.on("close", function() { 
	   
	   console.log("[CLOSE-CONN] Utenti loggati");
	   console.log(loggedUsers);
	   console.log("[CLOSE-CONN] Utenti connessi:");
	   console.log(connectedUsers);
	   
	   var key = user_utilities.findConnection(connection, connectedUsers);
	   console.log("[CLOSE-CONN]: key = "+key);
	   var loguser = user_utilities.findLoggedUserByName(key, loggedUsers);
	   console.log("[CLOSE-CONN] loguser:"+loguser);
	  
	   if(loguser != -1 && key != -1){
		   
		   console.log("[CLOSE-CONN] Trovato logged user: "+loggedUsers[loguser].name+", utenti loggati: "+loggedUsers.length);
		   user_utilities.deleteLoggedUserByName(loggedUsers[loguser].name, loggedUsers);
		   console.log("[CLOSE-CONN] Logged user eliminato, utenti loggati: "+loggedUsers.length);
		   
		   var conn = connectedUsers[key];
		   var other = connectedUsers[key].otherName;
		   
		   console.log("[CLOSE-CONN] Utente connected trovato: "+conn.name);
		   
		   if(other != null){
			   console.log("[CLOSE-CONN] Aggiorno chiusura chat con utente: "+other);
			   	
			   if(connectedUsers[other] != null){
				   
				   console.log("[CLOSE-CONN] Utente "+other+" trovato tra i connectedUsers, procedo alla chiusura chat");
				   connectedUsers[other].otherName = null;
				   var otherConn = connectedUsers[other];
				   
				   sendTo(otherConn, { 
		                  type: "close_chat" 
		               });
			   }
			   
		   }
		   
		   delete connectedUsers[key];
		   console.log("[CLOSE-CONN] Utenti connessi:");
		   console.log(connectedUsers);
		   console.log("[CLOSE-CONN] Utenti loggati");
		   console.log(loggedUsers);
		   
	  }else{
		  console.log("[CLOSE-CONN] loggedUser / connectedUser non trovato!");
	  }
	   
   });

  sendTo(connection,"Hello world from server!");
	
});
  

//************************************************* UTILITIES *************************************************************

//Si occupa di inviare messaggi verso la connection specificata in ingresso
function sendTo(connection, message) { 
   connection.send(JSON.stringify(message)); 
}


/*************************************************INACTIVITY INTERVAL SETUP*****************************************************
 * Il server nodeJS supporta un timeout di inattività: se un utente non invia offer/answer e non è impegnato in una qualche chat
 * per più di 30 minuti, viene automaticamente buttato fuori (dai loggedUsers e dai connectedUsers).
 * Questo intervallo di inattività viene calcolato usando l'attributo last_activity settato ogni volta che un utente
 * invia un offer, una answer, o fa il login.
 * Per fare questo andiamo a settare un timeout-interval, che si occupa di:
 * 	- (in maniera periodica, ogni 30 minuti):
 * 	- per ognuno degli utenti presenti tra i connectedUsers:
 *  - se l'utente non ha chat attive e ha un periodo di inattività maggiore di 30 minuti (calcolato usando l'attributo last_activity)
 *  allora prima verifico che l'utente sia tra i loggedUsers, e poi lo cancello dai loggedUsers e dai connectedUsers
 * 	(inviando però un messaggio di session_expired)
 * 
 */
var interval = setInterval(function(loggedUsers, connectedUsers) {
	
	console.log("[TIMEOUT CHECK]")
	var date = new Date();
	
	for(var key in connectedUsers){
		  
			if(date.getTime() - connectedUsers[key].last_activity.getTime() > constants.inactivity_limit_ms && connectedUsers[key].otherName == null){
			  
			  console.log("[TIMEOUT CHECK] Caccio: "+connectedUsers[key].name);
			  
			  if(user_utilities.findLoggedUserByName(connectedUsers[key].name, loggedUsers) != -1){
				  user_utilities.deleteLoggedUserByName(connectedUsers[key].name, loggedUsers);
				  console.log("[TIMEOUT CHECK] Eliminato dagli utenti loggati.");
			  }else{
				  console.log("[TIMEOUT CHECK] Utente "+connectedUsers[key].name+" non trovato tra i loggedUsers");
			  }
			  
			  sendTo(connectedUsers[key], { 
	               type: "status_msg", 
	               status: "expired_session"
	            }); 
			  
			  
			  delete connectedUsers[key];
			  
			  console.log("[TIMEOUT CHECK] Eliminato dagli utenti connected");
			  console.log("[TIMEOUT CHECK] Utenti connessi:");
			  console.log(connectedUsers);
			  console.log("[TIMEOUT CHECK] Utenti loggati");
			  console.log(loggedUsers);
		  }
		
	 }
	
	}, constants.interval_timeout_ms, loggedUsers, connectedUsers);





