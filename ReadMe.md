# Secure Messaging

L'obiettivo del progetto è lo sviluppo di una applicazione con interfaccia web-based di messaggistica point-to-point mediante ausilio di WebRTC, con funzioni di autenticazione gestite su un server Apache Tomcat attraverso servlets Java SSL, meccanismo a due fattori per il login di utenti da dispositivi non noti, gestione di policy di autorizzazione role-based tra gli utenti (mediante XACML) e persistenza delle informazioni gestita attraverso un database-server MySQL, anch'esso configurato con SSL.

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
* Utilizzo di Content-Security-Policy (**CSP**) Headers 
* Realizzazione di un **IPS** custom per evitare furto di account
* Utilizzo di una classe per l'autenticazione two-steps (e relativa libreria per interfacciamento **SMTP**)
* DBMS **MySQL**, per la gestione della persistenza;
* ~~*Calendario dei Santi* Aggiornato al 2018.~~

## Organizzazione Progetto

Il **progetto** è interamente contenuto all'interno della folder */CertificateServer*.

La **documentazione** è realizzata in LaTeX e i sorgenti sono localizzati in */LaTEX* mentre il compilato è in */Documentazione Finale*.

I diagrammi sono realizzati con Visual Paradigm, e la cartella */UML/Visual Paradigm* contiene il file del progetto.

La folder */Demo* contiene un **video** illustrativo del progetto.

## Getting Started

Per essere in grado di eseguire l'applicativo, si ha bisogno di effettuare e configurare applicativi di terze parti. In particolare, è necessario avere:

* Java JRE (la versione utilizzata è la 1.8);
* Distribuzione Apache Tomcat (la versione utilizzata è la 7.0);
* Database Server MySQL;
* NodeJS;

La guida completa per la configurazione dell'applicativo, corredata di guide ed esempi, si trova nella cartella */Configurazione*.

## Esecuzione Applicazione

Arrivati a questo punto è possibile eseguire l'applicativo navigando direttamente alla pagina web:

```
https://localhost:8443/CertificateServer/pages/login.html
```

Si consiglia l'utilizzo di browser Google Chrome. 
Si sono riscontrati problemi con Mozilla Firefox e Apple Safari per il supporto WebRTC.

**Attenzione**: assicurarsi di essere connessi a Internet per essere sicuri del corretto comportamento dell'applicazione.

E' necessario, al momento della prima apertura della applicazione contrassegnare il certificato del server Tomcat come *trusted*. 
Il browser, con ogni probabilità, indicherà che non è sicuro in quanto self-signed.



## Autori

* **Francesco Parricelli** 
* **Aldo Strofaldi** 
* **Luca Pirozzi** 


 
