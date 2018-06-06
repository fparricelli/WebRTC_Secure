**********README***********

La configurazione MYSQL dovrebbe rimanere invariata rispetto a quella già fatta per il progetto SSD.
Per quanto riguarda la configurazione di Tomcat, ho scoperto (a mie spese) che Eclipse (probabilmente dalle ultime versioni) utilizza un meccanismo per il quale
la configurazione originale di Tomcat (presente nella cartella di installazione di Tomcat) viene copiata in una cartella interna al workspace e usata AL POSTO di quella originale.
Per verificare la cartella dalla quale Tomcat sta leggendo la configurazione, nell'output di startup di Tomcat è necessario andare a leggere il valore della variabile CATALINA_BASE.
Sono quindi possibili due soluzioni:
	1) usare la cartella interna al workspace gestita da Eclipse (nota bene: in questo caso, le modifiche alla configurazione di tomcat che facevamo nel web.xml -ad esempio: SSL-
	devono essere fatte sul web.xml gestito da eclipse e NON sul web.xml presente nella cartella originale di tomcat)
	In genere la cartella gestita da eclipse dovrebbe essere in una directory tipo questa (ed è comunque visibile ed accessibile internamente al workspace)
	D:\Unina\Eclipse_workspaces\Eclipse_java\WorkspaceAT\.metadata\.plugins\org.eclipse.wst.server.core\tmp0
	2) usare la cartella originale di tomcat (come già fatto).
	
Per selezionare una delle due modalità, quando aggiungiamo il server Tomcat su Eclipse è possibile fare doppio-click sulla voce relativa (nella tab Servers) per aprire una pagina di configurazione.
In tal caso:
	-Spuntando l'opzione 'use workspace metadata' usiamo la soluzione 1
	-Spuntando l'opzione 'use tomcat installation' usiamo la soluzione 2
	In ogni caso, assicuratevi di tenere la spunta 'Enable Security' disattivata, altrimenti Eclipse si prende la libertà di modificare da solo la configurazione SSL.
	La configurazione SSL resta la stessa rispetto a quella già vista, ovvero nel file server.xml è necessario aggiungere il connector SSL, che riporto qui per brevità:
	
	
	    <Connector SSLEnabled="true" 
			clientAuth="false" keystoreFile="${user.home}/tomcat_keystore.jks" 
			keystorePass="tomcatkeystore" maxThreads="200" port="8443" 
			protocol="org.apache.coyote.http11.Http11NioProtocol" scheme="https" 
			secure="true" sslProtocol="TLS"/>
			
	(modificate poi i path verso i keystore in maniera opportuna: i file .jks sono gli stessi usati per SSD)	
	
	A tal proposito,  notare che in questo modo Eclipse prende controllo della cartella di installazione specificata: tutte le impostazioni che modifichiamo da questa tab
	di configurazione avranno effetto sulla configurazione, quindi fate attenzione a cosa modificate.
	
	
	Per la configurazione di Node JS, scaricare e installare il pacchetto all'indirizzo: https://nodejs.org/it/ (consiglio la LTS)
	Poi, in eclipse, andare in Window>Preferences>JavaScript>Runtimes.
	Da qui, nel menu a tendina, selezionare Node JS Runtime, poi cliccare su 'Add' e puntare all'eseguibile scaricato e installato precedentemente (ricordatevi di spuntarlo, alla fine)
	Infine, per far girare il server, tasto destro sul file server.js > Run as > Node JS Application.
	
	Per testare il tutto:
	1)Avviare il Certificate Server su Tomcat
	2)Avviare il server node js (cartella nodejs del progetto CertificateServer)
	3)Aprire due finestre con la pagina contacts.html (all'url: https://localhost:8443/CertificateServer/pages/contact.html)
	4)Selezionare utente e ruolo
	5)Cliccare su 'Contatta...' in base al ruolo dell'interlocutore 
		nota: il click sul bottone 'Contatta...' va fatto su entrambi i client (a breve carico una correzione per questa cosa)
	6)sul redirect alla nuova pagina, se tutto è andato a buon fine, cliccare sul bottone 'Current User' per loggare sul server nodejs
		nota: il click sul bottone 'Current User' va fatto su entrambi i client  (a breve carico una correzione per questa cosa)
	7)Se tutto va a buon fine, dovrebbe apparire il contenuto della contact list prelevata dal server CertificateServer (su entrambi i client)
	8)A questo punto, chi deve avviare la comunicazione clicca sul bottone 'contatta'
	9)Se l'utente richiesto è online, si apre la chat area con cui è possibile comunicare
	
	Per informazioni più dettagliate, date un'occhiata ai file contact.js, client.js e server.js (commentati).
	
	
	
	
	