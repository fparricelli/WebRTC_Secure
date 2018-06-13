************************README**********************************
CONFIGURAZIONE:

Per essere in grado di eseguire l'applicativo, si ha bisogno di effettuare e configurare applicativi di terze parti. In particolare, è necessario avere:

    Java JRE (la versione utilizzata è la 1.8);
    Distribuzione Apache Tomcat (la versione utilizzata è la 7.0);
    Database Server MySQL;
    NodeJS (utilizzata : LTS)
	
	Si consiglia l'utilizzo di browser Google Chrome o Mozilla Firefox. 
	Si sono riscontrati problemi con Apple Safari per il supporto WebRTC.
	
	
1) CONFIGURAZIONE MySQL + SSL
I dettagli della configurazione MySQL sono descritti in maniera dettagliata (comprensivi di demo per testare la configurazione) nella cartella Configurazione/MySQL.

2) CONFIGURAZIONE Tomcat
Per configurare Tomcat, è necessario esclusivamente attivare la configurazione SSL, modificando il file server.xml.
In particolare, la modifica che va aggiunta è la seguente:

<Connector
           protocol="org.apache.coyote.http11.Http11NioProtocol"
           port="8443" maxThreads="200"
           scheme="https" secure="true" SSLEnabled="true"
           keystoreFile="<path>/tomcat_keystore.jks" keystorePass="tomcatkeystore"
           clientAuth="false" sslProtocol="TLS"/>

Il file (tomcat_keystore.jks) a cui deve puntare si trova nella cartella Configurazione/Tomcat.
Assicurarsi di configurare in maniera opportuna il path del file; la password deve rimanere intatta.
Da notare che, sotto Eclipse, con le versioni più recenti viene creata una cartella gemella di quella originale (dell'installazione tomcat) all'interno del workspace
da cui vengono lette le impostazioni del server tomcat: di conseguenza , tutte le modifiche ai file di configurazione devono essere fatte ai file contenuti in quella cartella
e non ai file contenuti nella cartella originale di installazione.
E' possibile verificare quale tipo di impostazione è in uso cliccando due volte sul server tomcat (nella tab servers, in eclipse).


Ora dobbiamo aggiungere il certificato di Tomcat al trust-store della JVM: il certificato si trova in Configurazione/Tomcat.
ATTENZIONE: è necessario che tutta questa operazione sia fatta avendo come riferimento la JRE che utilizzate anche all'interno di Eclipse.
Dal momento che la JDK, quando installata, contiene al proprio interno anche una JRE, controllate in Eclipse qual'è il percorso della JRE che state utilizzando.
	> Se in Eclipse state utilizzando la JRE presente in Java>JDK>JRE, allora dovete navigare in Java>JDK>JRE>lib>security, e lavorare con il file cacerts che si trova li.
	> Se in Eclipse state utilizzando la JRE presente in Java>JRE, allora dovete navigare in Java>JRE>lib>security e lavorare col file cacerts che trovate li.
	
Una volta posizionati (tramite shell) nel percorso opportuno secondo quanto detto prima, lanciate il seguente comando:

keytool -import -alias tomcat -file <path-certificato>\TomcatServerCertificate.cer -keystore cacerts
	
Vi chiederà diverse cose (inclusa la password del keystore cacerts, che è: changeit), rispondete si e completate il procedimento.
Per essere sicuri che il certificato sia stato correttamente aggiunto, basta digitare il seguente comando:

keytool -list -keystore cacerts -alias tomcat

Appariranno un bel pò di certificati con i vari dettagli: assicuratevi che il certificato con alias=tomcat sia presente, in quel caso siamo a posto.

3) CONFIGURAZIONE NodeJS

Avendo abilitato SSL anche per il server nodeJS (che richiede un certificato a parte), è necessario aggiungere al cacerts di Java il certificato che trovate nella cartella Configurazione/Tomcat/tomcat.crt
Per fare questo, navigate fino alla directory:
	<Java JDK>/<Java JRE>/lib/security (se usate la JDK)
	<Java JRE>/lib/security (se usate la JRE)
	(Assicuratevi che la cartella JDK/JRE su cui operate sia la stessa che viene vista da eclipse come Java Runtime)
	
	Dopodichè, una volta nella cartella, copiateci dentro il file tomcat.crt e digitate il seguente comando:
	
	keytool -import -alias tomcat_nodejs (o qualunque alias vogliate) -file tomcat.crt -keystore cacerts -storepass changeit
	
	Per verificare che sia stato importato correttamente, digitate:
	
	keytool -list -keystore cacerts -alias <alias utilizzato>
	
	
4) VARIABILI D'AMBIENTE

Creare una variabile di ambiente chiamata

SECURE_MESSAGING_HOME

e far sì che punti nella cartella .... / CertificateServer


