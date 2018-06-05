//*****************************************CODICE SERVER NODEJS***********************************************************
/*
 * Il codice implementa un signaling server WEBRTC.
 * Per questioni di integrazione, il server consente agli utenti di fare il login (verificando semplicemente che l'username
 * specificato non sia già connesso).
 * Dopodichè si occupa di gestire tutto il ciclo di vita RTC, facendo da tramite tra i due peer comunicanti.* 
 * 
 */

const httpServ = require('https');
const fs = require('fs');
const crypto = require('crypto')
var constants = require('./constants.js');
var utilities = require('./utilities.js');
var user_utilities = require('./user_utilities.js');


var ws_cfg = {
		  ssl: true,
		  port: constants.server_port,
		  ssl_key: constants.ssl_key_path,
		  ssl_cert: constants.ssl_cer_path
		};

var app = null;

app = httpServ.createServer({
  key: fs.readFileSync(ws_cfg.ssl_key),
  cert: fs.readFileSync(ws_cfg.ssl_cert)
}, processRequest).listen(ws_cfg.port);

var processRequest = function(req, res) {
    console.log("HTTPS Request received.")
};




var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer( {server: app});



var loggedUsers = [];
var connectedUsers = {};
  
//Quando un nuovo utente si connette.. 
wss.on('connection', function(connection) {
  
   console.log("[ON-OPEN] Utente connesso.");
	 
   //Quando il server riceve un messaggio da parte di un utente..
   connection.on('message', async function(message) {
	 
	  //accettiamo solo messaggi JSON
      var data; 
      
      try { 
         data = JSON.parse(message); 
      } catch (e) { 
         console.log("Invalid JSON"); 
         data = {}; 
      }

      //In base al tipo di messaggio ricevuto...
      switch (data.type) { 
      
      
      
      
      /* Quando un utente effettua il login, verrà autenticato dal server Tomcat.
       * Se l'autenticazione va a buon fine, il server tomcat si occuperà di aprire una websocket
       * verso il server nodejs e mandargli un messaggio, per segnalare l'utente appena connesso.
       * Il messaggio inviato da tomcat conterrà l'hash di un file (secure_key.txt) disponibile solo al server tomcat
       * e al server nodeJS.
       * In questo modo, quando il server nodeJS riceverà il messaggio da tomcat contenente le informazioni sull'utente
       * loggato, effettuerà l'hash dello stesso file (secure_key.txt) e se gli hash corrispondono, potrà procedere
       * all'aggiunta dell'utente alla lista loggedUsers (se possibile, vedi sotto).
       * In questo modo si evita che un qualsiasi utente esterno apra una connessione websocket verso il server nodeJS
       * e gli invii messaggi di login.
       * Inoltre, visto che ammettiamo un client single-chat, se un utente dovesse effettuare nuovamente il login (lato tomcat)
       * quest'ultimo invierebbe un nuovo messaggio al nodeJS che segnala il login di quell'utente: il server nodeJS però
       * controllerà nella lista degli utenti loggati (loggedUsers), e se trova un utente già presente, non effettuerà l'aggiunta.
       */
      
       case "tomcat_msg":
    	  
    	  console.log("[TOMCAT-MSG] Ricevo da tomcat :", data); 
    	  
    	  var hash = await utilities.fileHash();
    	  
    	  console.log("[TOMCAT-MSG] Hash calcolato:"+hash);
    	  console.log("[TOMCAT-MSG] Hash ricevuto:"+data.hash);
    	  
    	  if(hash != data.hash){
    		  console.log("[TOMCAT-MSG] Hash check fallito, non loggo!");
    	  }else{
    		  
    		  console.log("[TOMCAT-MSG] Hash check riuscito!");
    		  
    		  var user = {
    				  name: data.name,
    				  token: data.token,
    				  roleNumber: data.roleNumber
    				 
    		  }
    		  
    		  var p = user_utilities.findLoggedUserByName(data.name, loggedUsers);
    		  
    		  if(p == -1){
    			  console.log("[TOMCAT-MSG] Utente "+data.name+" non trovato tra i logged users, aggiungo.");
    			  loggedUsers.push(user);
    		  }else{
    			  console.log("[TOMCAT-MSG] Utente "+data.name+" già presente tra i logged users, non aggiungo!");
    			  var new_token = data.token;
    			  var old_token = loggedUsers[p].token;
    			  
    			  loggedUsers[p].last_activity = new Date();
    			  
    			  if(old_token != new_token){
    				  console.log("[TOMCAT-MSG] Aggiorno token!");
    				  loggedUsers[p].token = new_token;
    			  }
    		  }
    		  
    		  console.log("[TOMCAT-MSG] Ci sono: "+loggedUsers.length+" utenti loggati.");
    		  console.log("[TOMCAT-MSG] lista:");
    		  console.log(loggedUsers);
    		  
    	}
    	  
    	  
    	break;
    	
    	/* Dopo che l'utente è stato loggato e autenticato dal server tomcat (con tutta la procedura vista sopra)
    	 * esso si connetterà al server nodeJS per avviare la chat.
    	 * Nel farlo, invierà un messaggio user_select (JSON) con le proprie informazioni:
    	 * {
         * 	type: user_select
         * 	name : 'myusername' 			
         * 	roleNumber : myrolenumber
         *  token : <token>
         * }
    	 * A questo punto il server nodeJS si occuperà semplicemente di verificare che le info utente contenute nel messaggio
    	 * siano effettivamente contenute nella lista di utenti loggati (loggedUsers) .
    	 * Se l'utente contenuto nel messaggio non è presente nella lista loggedUsers significa che un utente vuole accedere
    	 * al server nodeJS senza prima essere passato per l'autenticazione lato tomcat, quindi rimando al login.
    	 * In caso contrario, se l'utente nel messaggio è presente tra i loggedUsers, lo aggiungo alla lista connectedUsers 
    	 * (ovvero: gli utenti connessi al server nodeJS)
    	 * 
    	 */
    	
         
         case "user_select":
        	 
        
           console.log("[USER-SELECT] Ricevo le seguenti informazioni utente:", data); 
           console.log("[USER-SELECT] Ho:"+loggedUsers.length+" utenti loggati!");
           

           var find = user_utilities.findUser(data, loggedUsers);
           
           if(find == -1){
        	   console.log("[USER-SELECT] Utente non trovato tra gli utenti loggati!");	//rimando al login
        	   
        	   sendTo(connection, { 
                   type: "status_msg", 
                   status: "failed_login"
                });         	   
        	   
           }else{
        	   
        	    console.log("[USER-SELECT] Trovato utente loggato!");
        	   var u = user_utilities.findConnectedUserByName(data.name, connectedUsers);
        	   
        	   if(u == -1){
        		   console.log("[USER-SELECT] Utente "+data.name+" non trovato tra i connectedUsers, procedo");
        		   
        		   connectedUsers[data.name] = connection;            	   
            	   connectedUsers[data.name].token = data.token;
            	   connectedUsers[data.name].roleNumber = data.roleNumber;
            	   connectedUsers[data.name].name = data.name;
            	   connectedUsers[data.name].last_activity = new Date();
            	   
            	   sendTo(connection, { 
                       type: "user_select", 
                       success: true 
                    }); 
            	   
            	   console.log("[USER-SELECT] UTENTI CONNESSI:");
            	   console.log(connectedUsers);
            	   
        	   }else{
        		   
        		   console.log("[USER-SELECT] Utente "+data.name+" già trovato tra gli utenti connessi!");        		   
        		   
        		   sendTo(connection, { 
                       type: "status_msg", 
                       status: "failed_login"
                   }); 
        		   
        		   
        	   }
        	   
           }
           
         break;
            
         case "offer":
        	 
        	 /* Possibile scenario: A invia offerta a B
        	  * A invia messaggio "offer" al server
        	  * Il server:
        	  * 	=>verifica se A è presente tra gli utenti loggati/connessi
        	  * 		=>in caso contrario, invia all'utente A messaggio: no_sender (che rimanda al login)
        	  * 		=>in caso affermativo, verifica se l'utente B è presente tra gli utenti loggati/connessi
        	  * 			=>in caso contrario, invia all'utente A messaggio: offline (B è offline, non rimando al login)
        	  * 			=>in caso affermativo (B online) il server procede a verificare che A abbia i permessi per parlare con B e che abbia il token valido
        	  * 				=>se A può parlare con B e il suo token è OK, invia a B messaggio: offer, e invia token rinnovato ad utente A (controllando che B non sia già impegnato in un'altra chat)
        	  * 				=>se A non può parlare con B (permesso negato) ma il suo token è OK, invia ad A messaggio: permesso negato + token rinnovato
        	  * 				=>se il token di A è scaduto, invio ad A messaggio: token expired (che rimanda al login)
        	  * 				=>in caso di server error, mando ad A messaggio: error (rimanda al login)
        	  */
        	        	 
        	 
        	 console.log("[OFFER] Ricevuta offerta da parte di:"+data.sender);
        	 console.log("[OFFER] Tentativo di invio offerta a:"+data.name);

        	 //verifico che il sender sia tra gli utenti loggati/connessi
        	 var sender_ok = user_utilities.checkUserPresence(data.sender, loggedUsers, connectedUsers);        	
        	 
        	 
        	 if(!sender_ok){
        		 //sender non trovato
        		 console.log("[OFFER] Sender non trovato!");
        		 sendTo(connection, { 
                     type: "status_msg", 
                     name: data.name,
                     status: "no_sender"
                  });
        		 
        	 }else{
        		 //sender trovato
        		 console.log("[OFFER] Sender trovato!");
        		 //verifico che il destinatario sia tra gli utenti loggati/connessi
        		 var rec_ok = user_utilities.checkUserPresence(data.name, loggedUsers, connectedUsers);
        		 
        		 if(!rec_ok){
        			 //destinatario non trovato (offline)
        			 console.log("[OFFER] Destinatario non trovato!");
        			 
        			 sendTo(connection, { 
                         type: "status_msg", 
                         name: data.name,
                         status: "rec_offline_offer"
                      });
        			 
        			 
        		 }else{
        			 console.log("[OFFER] Sender e Destinatario online!");
        			 
        			 //sender e destinatario trovati, ora devo controllare permessi e token
        			 //recupero sender e destinatario
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
        			 
        			 //verifico i permessi: sender può parlare con destinatario?
        			 var res = await user_utilities.checkUserToken(data.sender_token, list, role_send);
        			 
        			 if(res.result == constants.PERMIT){
        				 
        				 console.log("[OFFER] Permesso accordato, posso inviare offerta.");
        				 
        				 //invio nuovo token all'utente sender
        				 sendTo(connection, { 
        	                    type: "new_token", 
        	                    newtoken: res.newtoken
        	                 });
        				 
        				 //aggiorno nuovo token per utente sender
        				 connectedUsers[data.sender].token = res.newtoken;
        				 
        				 var lp = user_utilities.findLoggedUserByName(data.sender, loggedUsers);
        				 loggedUsers[lp].token = res.newtoken;
        				 
        				 connectedUsers[data.sender].last_activity = new Date();
        				 //loggedUsers[lp].last_activity = new Date();
        				 
        				 console.log("[OFFER] nuovo token aggiornato per utente "+data.sender);
        				 
        				 if(connectedUsers[data.name].otherName != null){
        					 
            				 console.log("[OFFER] Utente destinatario "+data.name+" già impegnato!");
            				 
            				 sendTo(connection, { 
         	                    type: "status_msg", 
         	                    name: data.name,
         	                    status: "rec_busy"
         	                 });
            				 
            			 }else{
        				 
            				 //invio offerta all'utente receiver
            				 	sendTo(rec, { 
            				 			type: "offer", 
            				 			offer: data.offer, 
            				 			namesurname: data.namesurname,
            				 			username: data.sender,
            				 			status: "online",
            				 			role: data.role
            				 		}); 
        				
            			 }
        				 
        			 }else if(res.result == constants.DENY){
        				 
        				 console.log("[OFFER] Permesso negato per l'utente: "+data.sender);
        				 
        				//invio nuovo token all'utente sender
        				 sendTo(connection, { 
        	                    type: "new_token", 
        	                    newtoken: res.newtoken
        	                 });
        				 
        				//aggiorno nuovo token per il sender
        				 connectedUsers[data.sender].token = res.newtoken;
        				 console.log("[OFFER] nuovo token aggiornato per utente:"+data.sender);        				 
        				 
        				 //gli invio messaggio di permesso-negato
        				 sendTo(connection, { 
                             type: "status_msg", 
                             name: data.name,
                             status: "rec_denied"
                          });
        				 
        			 }else if(res.result == constants.TOKEN_EXPIRED){
        				 
        				 console.log("[OFFER] Token Expired per utente:"+data.sender);
        				 
        				 //gli invio messaggio di token-expired
        				 sendTo(connection, { 
                             type: "status_msg", 
                             name: data.name,
                             status: "token_expired"
                          });        			 
        			 
        			 }else{
        				 
        				 console.log("[OFFER] Errore!");
        				 
        				 //errore (rimanda al login)
        				 sendTo(connection, { 
                             type: "status_msg", 
                             name: data.name,
                             status: "error"
                          });
        				 
        			}
        			 
        			 
        			 
        			 
        			 
        		 }
        		 
        		 
        		 
        		 
        	 }
        	 
        	
        		
        		
        		
        break;		
        
         /* Scenario di utilizzo:
          * A invia offer a B 
          * B deve rispondere ad A (B invia answer ad A)
          * Il server:
          * 	=> verifica se B è tra gli utenti loggati/connessi
          * 		=> in caso contrario: rimando al login (messaggio no_sender)
          * 		=> in caso affermativo, verifico se A è presente tra gli utenti loggati/connessi
          * 			=> in caso contrario, avviso l'utente B (messaggio rec_offline)
          * 			=> in caso affermativo, verifico se il token di B è valido (i permessi vengono controllati solo per la offer)
          * 				=> se il token di B è valido, invio nuovo token a B, setto nuova connessione tra A e B e invio answer ad A
          * 				=> altrimenti, in caso di errore o token expired, rimando al login (per B) e invio messaggio no_answer ad A
          * 
          */
         
         case "answer": 
        	 console.log("[ANSWER] Stampo answer");
        	 
        	 console.log("[ANSWER] Ricevuta answer da:"+data.sender);
        	 console.log("[ANSWER] Tento di inviare risposta a:"+data.name);
        	 
        	 
        	 //controllo se il sender è presente tra gli utenti loggati e connessi
        	 var sender_ok = user_utilities.checkUserPresence(data.sender, loggedUsers, connectedUsers);
        	 
        	 
        	 
        	 if(!sender_ok){
        		 
        		 console.log("[ANSWER] Sender non trovato!");
        		 sendTo(connection, { 
                     type: "status_msg", 
                     name: data.name,
                     status: "no_sender"
                  });
        		 
        	 }else{
        		 console.log("[ANSWER] Sender trovato!");
        		 //sender trovato, cerco il destinatario
        		 var rec_ok = user_utilities.checkUserPresence(data.name, loggedUsers, connectedUsers);
        		 if(!rec_ok){
        			 
        			 console.log("[ANSWER] Destinatario non trovato!")
        			 
        			 sendTo(connection, { 
                         type: "status_msg", 
                         name: data.name,
                         status: "rec_offline"
                      });
        			 
        			 
        		 }else{
        			 console.log("[ANSWER] Sender e Destinatario online!");
        			 
        			//sender e destinatario trovati, ora devo controllarne i permessi
        			 var sender = user_utilities.findConnectedUserByName(data.sender, connectedUsers);
        			 var rec = user_utilities.findConnectedUserByName(data.name, connectedUsers);
        			 
        			 
        			 
        			 if(data.deny){
        				 console.log("[ANSWER] Ricevuta answer con deny:"+data.sender+" non vuole parlare con "+data.name);
        				 
        				 sendTo(rec, { 
       	                  	type: "status_msg", 
       	                  	status: "denied_chat"
       	               }); 
        				 
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
        			 
        			 var res = await user_utilities.checkUserToken(data.sender_token, role_send, list);
        			 
        			 if(res.result == constants.PERMIT || res.result == constants.DENY){
        				 
        				 console.log("[ANSWER] invio nuovo token all'utente "+data.sender);
        				 //invio nuovo token all'utente sender
        				 sendTo(connection, { 
        	                    type: "new_token", 
        	                    newtoken: res.newtoken
        	                 });
        				 
        				 //aggiorno nuovo token
        				 connectedUsers[data.sender].token = res.newtoken;
        				 var lp = user_utilities.findLoggedUserByName(data.sender, loggedUsers);
        				 loggedUsers[lp].token = res.newtoken;
        				 
        				 connectedUsers[data.sender].last_activity = new Date();
        				 //loggedUsers[lp].last_activity = new Date();
        				 
        				 console.log("[ANSWER] utente:"+data.sender);
        				 console.log("[ANSWER] nuovo token aggiornato per utente:"+data.sender);
        				 
        				 //setto nuova connessione per l'utente sender
        				 connectedUsers[data.sender].otherName = data.name;
        				 //setto nuova connessione per l'utente receiver
        				 connectedUsers[data.name].otherName = data.sender;
        				 
        				 console.log("[ANSWER] utente "+data.sender+" connesso con:"+connectedUsers[data.sender].otherName);
        				 console.log("[ANSWER] utente "+data.name+" connesso con:"+connectedUsers[data.name].otherName);
        				 
        				 //invio la risposta al destinatario
        	             sendTo(rec, { 
        	                  type: "answer", 
        	                  answer: data.answer,
        	                  name : data.name,
        	                  role : data.role,
        	                  deny: data.deny
        	               }); 
        				 
        			 }else{
        				 
        				 //qui: o siamo andati in ERROR o in TOKEN_EXPIRED, quindi rimando comunque al login
        				 //per il sender, mentre avviso normalmente il receiver
        				 console.log("[ANSWER] invio no_answer ad utente:"+data.name);
        				 sendTo(rec, { 
       	                  type: "status_msg",
       	                  name: data.sender,
       	                  status: "no_answer"
       	               }); 
        				 
        				 
        				 if(res.result == constants.TOKEN_EXPIRED){
        					 console.log("[ANSWER] Token Expired per utente:"+data.sender);
        					 sendTo(connection, { 
          	                    type: "status_msg",
          	                    name: data.name,
          	                    status: "token_expired"
          	                 });       					 
        					 
        				 }else{
        					 
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
        	 
         
         /* Scambio candidates tra mittente e destinatario: i controlli fatti sono gli stessi di sopra,
          * nello specifico controlliamo se mittente e destinatario sono presenti tra gli utenti loggati/connessi.          * 
          */
         
         case "candidate":
        	 console.log("[CANDIDATES] Invio candidates da "+data.sender+" verso "+data.name);
        	 
        	 var sender_ok = user_utilities.checkUserPresence(data.sender, loggedUsers, connectedUsers);
        	 if(!sender_ok){
        		 console.log("[CANDIDATES] Sender non trovato!");
        		 
        		 sendTo(connection, { 
                     type: "status_msg", 
                     name: data.name,
                     status: "no_sender"
                  });      		 
        		 
        	 }else{
        		 console.log("[CANDIDATES] Sender trovato!");
        		 var rec_ok = user_utilities.checkUserPresence(data.name, loggedUsers, connectedUsers);  
        		 
        		 if(!rec_ok){
        			 console.log("[CANDIDATES] Destinatario non trovato!");
        			 
        			 sendTo(connection, { 
                         type: "status_msg", 
                         name: data.name,
                         status: "rec_offline"
                      });
        			 
        		 }else{
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
          
          
         /* Il messaggio di close_chat viene inviato quando uno tra mittente e destinatario decide di chiudere la chat.
          * In particolare verifichiamo che mittente e destinatario siano tra gli utenti loggati/connessi,
          * e inoltre verifichiamo che siano connessi gli uni con gli altri.
          * In caso affermativo, rimuoviamo la chat attiva tra i due utenti e inviamo un messaggio close_chat all'altro utente.         * 
          */ 
          
         case "close_chat":
        	 
        	 console.log("Richiesta di chiusura chat da parte di "+data.sender+" per la chat con "+data.name);
        	 
        	 var sender_ok = user_utilities.checkUserPresence(data.sender, loggedUsers, connectedUsers);
        	 if(!sender_ok){
        		 console.log("[CLOSE] Sender non trovato!");
        		 
        		 sendTo(connection, { 
                     type: "status_msg", 
                     name: data.name,
                     status: "no_sender"
                  });      		 
        		 
        	 }else{
        		 console.log("[CLOSE] Sender trovato!");
        		 var rec_ok = user_utilities.checkUserPresence(data.name, loggedUsers, connectedUsers);  
        		 
        		 if(!rec_ok){
        			 console.log("[CLOSE] Destinatario non trovato!");
        			 
        			 sendTo(connection, { 
                         type: "status_msg", 
                         name: data.name,
                         status: "rec_offline"
                      });
        			 
        		 }else{
        			 
        			 console.log("[CLOSE] Destinatario trovato!");
        			 
        			 var sender = user_utilities.findConnectedUserByName(data.sender, connectedUsers);
        			 var rec = user_utilities.findConnectedUserByName(data.name, connectedUsers);
        			 
        			 console.log("[CLOSE] utente"+data.sender+" è connesso con:"+connectedUsers[data.sender].otherName);
        			 
        			 if(connectedUsers[data.sender].otherName != data.name || connectedUsers[data.name].otherName != data.sender){
        				 console.log("[CLOSE] Chat con utente "+data.name+" non trovata, non posso chiuderla!");
        				 
        				 
        				 sendTo(connection, { 
                             type: "status_msg", 
                             name: data.name,
                             status: "error"
                          });
        				 
        			 }else{
        				 
        				 console.log("[CLOSE] Chat trovata, procedo alla chiusura.");
        				 connectedUsers[data.sender].otherName = null;
        				 connectedUsers[data.name].otherName = null;
        				 
        				 sendTo(rec, { 
                             type: "close_chat", 
                         });
        				 
        			 }
        			 
        			 
        			 
        		 }
        	 }
         
         break;
         
         
         //in caso di comando non riconosciuto..
         default:
			 
        	console.log("COMANDO NON RICONOSCIUTO");
         	console.log(data);
            sendTo(connection, { 
               type: "status_msg", 
               status: "error"
            }); 
				
            break;
				
      }  
   });
	
   //Quando l'utente esce (chiude browser, refresh)..
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
  

//*************************************************FINE CODICE SERVER RTC**********************************************************



//*************************************************FUNZIONI DI UTLITA'*************************************************************

function sendTo(connection, message) { 
   connection.send(JSON.stringify(message)); 
}


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





