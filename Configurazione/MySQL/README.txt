ISTRUZIONI CONFIGURAZIONE MYSQL-SSL

1) Innanzitutto, assicuratevi di avere installato MySQL.
2) Utilizzando la SQL command line, accedete con l'utente root e digitate il seguente comando:

show global variables like '%ssl%';

Dovrebbe apparirvi una schermata di questo tipo:

+---------------+-------------------------------------+
| Variable_name | Value                               |
+---------------+-------------------------------------+
| have_openssl  | DISABLED                            |
| have_ssl      | DISABLED                            |
| ssl_ca        |        						      |
| ssl_capath    |                                     |
| ssl_cert      | 									  |
| ssl_cipher    |                                     |
| ssl_crl       |                                     |
| ssl_crlpath   |                                     |
| ssl_key       | 									  |
+---------------+-------------------------------------+

Possiamo quindi procedere per andare a configurare il tutto.

3) E' necessario installare openSSL.
Il link per windows è il seguente: http://gnuwin32.sourceforge.net/packages/openssl.htm (wizard)
Per Mac penso che i file da scaricare si trovino in: https://www.openssl.org/source/

4) Dopo aver installato openSSL, è necessario settare una variabile d'ambiente.
Lato Windows, usando il seguente comando cmd:

set OPENSSL_CONF=C:\Program Files (x86)\GnuWin32\share\openssl.cnf

(Chiaramente dipende da dove è installato openSSL)

Per quanto riguarda il Mac cambia poco, il nome della variabile d'ambiente è sempre lo stesso, e deve far riferimento al path del file openssl.cnf (può chiamarsi anche openssl.cfg, nel caso non fosse presente il .cnf)

5) Iniziamo col creare una cartella in cui manterremo tutti i file che ci servono, ad esempio: C:\mySQLcert

6) Tramite shell, posizionamoci nella cartella d'installazione di openssl, precisamente nella cartella bin.
Lanciamo i seguenti comandi, necessari per creare i file legati alla certification Authority (CA)

openssl genrsa 2048 > "C:\mySQLcert\ca-key.pem"

openssl req -new -x509 -nodes -days 3600 -key "C:\mySQLcert\ca-key.pem" > "C:\mySQLcert\ca-cert.pem"

(Anche qui vi chiederà i dettagli del certificato: potete anche lasciare tutto in bianco, userà valori di default)

Assicuratevi che nella cartella specificata siano presenti quindi i file ca-key.pem e ca-cert.pem.
In particolare, il file ca-cert.pem corrisponde al certificato della CA: non essendo in formato .cer/.der/.crt non potete aprirlo come al solito e visualizzarne i dettagli, però 
opzionalmente potete andare sul web e cercare dei servizi che fanno la conversione automatica in un formato .cer/.der/.crt, il che vi consente di aprire il certificato per visualizzarne
i dettagli.

7)Una volta definita la CA, possiamo definire i file che invece saranno legati al Server MySQL (che otterremo tramite 'richiesta' alla CA, che valideremo automaticamente)

Lanciamo nell'ordine i seguenti comandi:

openssl req -newkey rsa:2048 -days 3600 -nodes -keyout "C:\mySQLcert\my-server-key.pem" > "C:\mySQLcert\my-server-req.pem"

openssl x509 -req -in "C:\mySQLcert\my-server-req.pem" -days 3600 -CA "C:\mySQLcerts\ca-cert.pem" -CAkey "C:\mySQLcerts\ca-key.pem" -set_serial 01 > "C:\mysqlCerts\my-server-cert.pem"

In questo modo creeremo tre file all'interno della cartella: my-server-key.pem, my-server-req.pem, my-server-cert.pem.

8) A questo punto dobbiamo andare a modificare i file di configurazione di MySQL.
Lato Windows, il file in questione si chiama my.ini ed è localizzato nel percorso %PROGRAMDATA%/MySQL/MySQL-Server 5.7/
Lato Mac probabilmente il file ha un nome diverso (my.cnf): la posizione di default dovrebbe essere etc/, se li non è presente deve essere creato da zero (ma ci sono dei .cnf di esempio
nel path: /usr/local/mysql/support-files/ da cui prendere lo scheletro).

Una volta aperto il file my.ini (o my.cnf), localizzate al suo interno la stringa che comincia con [mysqld]: al di sotto di questa vanno inserite le seguenti stringhe:

ssl-ca="C:\mySQLcert\ca-cert.pem"
ssl-cert="C:\mySQLcert\my-server-cert.pem"
ssl-key="C:\mySQLcert\my-server-key.pem"

Salvate e chiudete.

9)Ora è necessario riavviare MySQL: lato windows questo può essere fatto eseguendo su shell i comandi:
net stop MySQL57
net start MySQL57

Per Mac (installazione > 5.7) i comandi dovrebbero essere:
sudo launchctl load -F /Library/LaunchDaemons/com.oracle.oss.mysql.mysqld.plist (per lo start)
sudo launchctl unload -F /Library/LaunchDaemons/com.oracle.oss.mysql.mysqld.plist (per lo stop)
(lascio un minimo di dubbio qui non potendoli testare)

10) Una volta riavviato mySQL con le sue nuove impostazioni, possiamo verificare che tutto sia andato a buon fine usando la command line SQL, e loggando con l'utente root.
Una volta all'interno, eseguite il comando:

show global variables like '%ssl%';

Dovrebbe apparirvi ora una tabella di questo tipo:

+---------------+---------------------------------------+
| Variable_name | Value                                 |
+---------------+---------------------------------------+
| have_openssl  | YES                                   |
| have_ssl      | YES                                   |
| ssl_ca        | C:\mySQLcert\ca-cert.pem              |
| ssl_capath    |                                       |
| ssl_cert      | C:\mySQLcert\my-server-cert.pem       |
| ssl_cipher    |                                       |
| ssl_crl       |                                       |
| ssl_crlpath   |                                       |
| ssl_key       | C:\mySQLcert\my-server-key.pem        |
+---------------+---------------------------------------+

Se così fosse, siamo a cavallo: la configurazione è stata letta correttamente.
Per essere ulterioremente sicuri, digitate il comando status e verificate che in corrispondenza di SSL vi sia "Cipher in use:.....".

NOTA: ho trovato un problema strano riguardo ai nomi dei file: usando come nomi server-cert.pem e server-key.pem la configurazione non riusciva a leggerli correttamente (nella tabella,
i nomi dei path erano sbagliati, con delle lettere mancanti) e quindi la configurazione non andava a buon fine: usando i nomi che ho proposto, dovrebbe andare comunque tutto bene 
(nell'eventualità, provate con nomi diversi).

NOTA2: nel caso doveste avere problemi per cui non appare il valore YES (nonostante i path siano visualizzati correttamente) potete provare a lanciare (sempre nella 
directory bin della cartella di openssl) il seguente comando:

openssl rsa -in "C:\mySQLcert\my-server-key.pem" -out "C:\mySQLcert\my-server-key-ppless.pem"

Questo creerà un nuovo file: my-server-key-ppless.pem, e dovremo aggiornare il file my.ini (o my.cnf) di MySQL specificando il nuovo file nel campo corrispondente a ssl-key;
dopodichè bisogna sempre riavviare mysql, come visto prima.

11) Per testare correttamente il tutto, verifichiamo che creando un nuovo utente e forzando la connessione con SSL, vada tutto a buon fine.
Con l'utente root, create un nuovo utente col comando:

CREATE USER 'ssluser'@'localhost' IDENTIFIED BY 'sslpassword' require ssl;

NOTA: quando creeremo utenti sul db, bisogna crearli SEMPRE esprimendo il require ssl alla creazione.

Dopodichè, fate il logout dall'account di root e proviamo ad accedere con questo nuovo account.
Posizionando la shell nel path bin dell'installazione di mysql lanciamo il comando:

mysql.exe -u ssluser -p --ssl-mode=REQUIRED (stessi parametri, comando equivalente per Mac)

Se ci fa accedere, è tutto apposto.
Proviamo ad accedere senza SSL col comando:

mysql.exe -u ssluser -p --ssl=0

Se non ci permette l'accesso, tutto è andato a buon fine.


--------Configurazione JDBC/MYSQL/SSL-------------------

Dopo esserci assicurati del corretto funzionamento di MySQL con SSL, possiamo procedere a configurare JDBC per connettersi via SSL al database server.


1)Come abbiamo fatto con Tomcat, dobbiamo aggiungere i certificati del server mysql (C:\mySQLcert\my-server-cert.pem) e della CA (C:\mySQLcert\ca-cert.pem) al trust-store della
JVM, in modo che possa considerare trusted il nostro database mysql (attraverso chain-verification con il certificato della CA).

Come fatto già con tomcat, posizioniamoci con la shell nella cartella jre/bin/lib/security, che contiene il file cacerts.
(NOTA: anche adesso si applica quanto detto già per tomcat riguardo alla JRE da utilizzare, che deve essere la stessa di quella usata da Eclipse)
Lanciamo quindi i seguenti comandi:

keytool -import -alias mysqlca -file C:\mySQLcert\ca-cert.pem -keystore cacerts (per importare il certificato della CA)

keytool -import -alias mysqlserver -file C:\mySQLcert\my-server-cert.pem -keystore cacerts (per importare il certificato del server mySQL)

(la password da inserire per il cacerts è, di default, changeit)

Anche stavolta digitiamo il seguente comando per visualizzare i certificati contenuti in cacerts, e assicuriamoci che i certificati aggiunti siano presenti:

keytool -list -keystore cacerts

In particolare, ci interessano i certificati con alias=mysqlca e alias=mysqlserver.

2)Dopo aver aggiunto i certificati al trust-store della JVM, possiamo passare lato Eclipse per testare che tutto sia funzionante correttamente.
Nell'archivio ho inserito un progetto di prova (MySQLSSLTest) che contiene un semplice main con il quale ci connettiamo al database usando SSL.

Prima di avviare il main, è necessario modificare i path specificati nella System.setProperty() in modo da puntare al path corretto del trust-store JVM.
Inoltre, assicurarsi di modificare anche il nome del db schema da accedere, cosi come nome utente, password e query in modo che corrispondano ad entità realmente presenti
sul database.

NOTA: anche per l'applicazione finale, è possibile usare il mySQL connector presente nella cartella libs.


Avviando l'applicazione, possiamo verificare se la stampa Connected va a buon fine: in tal caso, la connessione è avvenuta e tutto funziona come dovrebbe.
Se così fosse...complimenti!!












