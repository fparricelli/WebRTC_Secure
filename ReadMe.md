# Secure Messaging

L'obiettivo del progetto è lo sviluppo di una applicazione con interfaccia web-based di messaggistica point-to-point mediante ausilio di WebRTC, con funzioni di autenticazione gestite su un server Apache Tomcat attraverso servlets Java SSL, con meccanismo a due fattori per il login di utenti da dispositivi non noti, gestione di policy di autorizzazione role-based tra gli utenti, con la persistenza delle informazioni gestita attraverso un database-server MySQL, anch'esso configurato con SSL.

Le tecnologie/librerie utilizzate sono elencate di seguito:

* **CSS**, **HTML** per la gestione statica della GUI;
* **Javascript** e **JQuery** per la gestione dinamica della GUI;
* **AJAX**, per l'interazione asincrona tra il client e server;
* **NodeJS**, per la definizione e il deploy del server di segnalamento;
* **XACML**, per la definizione delle policy di autorizzazione role-based;
* **BCrypt**, per la gestione dei dati sensibili (i.e. le password);
* **WebRTC**, per lo scambio dei messaggi point-to-point su canale crittato;
* Java **Servlet**, per la gestione dei meccanismi di autorizzazione/autenticazione;
* **JSON**/**XML (con JAXB)**, come formato di scambio di dati;
* Realizzazione di un **IPS** custom per evitare furto di account
* Utilizzo di una classe per l'autenticazione two-steps (e relativa libreria per interfacciamento **SMTP**)
* DBMS **MySQL**, per la gestione della persistenza;
* *Calendario dei Santi* Aggiornato al 2018.

## Getting Started

Per essere in grado di eseguire l'applicativo, si ha bisogno di effettuare e configurare applicativi di terze parti. In particolare, è necessario avere:

* Java JRE (la versione utilizzata è la 1.8);
* Distribuzione Apache Tomcat (la versione utilizzata è la 7.0);
* Database Server MySQL;
* NodeJS;

### Configurazione SSL Apache Tomcat

What things you need to install the software and how to install them

```
Give examples
```

### Configurazione SSL MySQL


What things you need to install the software and how to install them

```
Give examples
```

## Esecuzione Applicazione

Arrivati a questo punto è possibile eseguire l'applicativo navigando direttamente alla pagina web:

```
https://localhost:8443/CertificateServer/pages/login.html
```

Si consiglia l'utilizzo di browser Google Chrome o Mozilla Firefox. 
Si sono riscontrati problemi con Apple Safari per il supporto WebRTC.

E' necessario, al momento della prima apertura della applicazione contrassegnare il certificato del server Tomcat come *trusted*. 
Il browser, con ogni probabilità, indicherà che non è sicuro in quanto self-signed.

### Break down into end to end tests

Explain what these tests test and why

```
Give an example
```

### And coding style tests

Explain what these tests test and why

```
Give an example
```

## Versioning


## Authors

* **Francesco Parricelli** 
* **Aldo Strofaldi** 
* **Luca Pirozzi** 


 
