Tra le servlet del server, nel package it.webfilters, trovate un filtro chiamato CSPPolicyApplier.
Si tratta di un filtro che aggiunge degli header speciali alla risposta che viene restituita al client, in sostanza andando a specificare
quali contenuti possono essere caricati dal browser e da dove (tra le altre cose, permette di mitigare attacchi XSS disabilitando javascript inline da console).
Dando un'occhiata alla servlet vi accorgerete che c'è un blocco di codice in cui vado a settare le varie cspPolicies: in questo modo sto dicendo quali sono le sorgenti
da cui voglio che il browser scarichi i js, i css, e così via.
Ora, i settaggi che ho messo sono:
	script-src 'self' "https://ajax.googleapis.com" (i file JS vengono caricati dal nostro server o da quelli di google, per jquery)
	connect-src : serve per specificare gli endpoint ammessi per le connessioni nel browser (nel nostro caso: il server e il websocket server)
	style-src: serve per specificare gli endpoint ammessi per scaricare i file .css: per ora ho settato * , ovvero: possiamo recuperarli da tutte le sorgenti.
	Magari quando abbiamo completato l'interfaccia grafica restringiamo soltanto ai domini necessari.
	font-src : come style-src, ma per i font-src
	...
	Una cosa molto importante da notare è che se un header non viene settato, il suo settaggio si basa sul settaggio fornito per l'header "default-src", che io ho settato a 'self'.
	Il che significa, per esempio, che se non vado a settare l'header "font-src", lui automaticamente capirà che per questo header deve applicare il settaggio che trova in "default-src",
	ovvero 'self' (e quindi scaricherà i font solo se provengono dal nostro server).
	Ci sono altri header che è possibile definire (per esempio per specificare da dove scaricare video o immagini), per una panoramica vi rimando a : https://www.html5rocks.com/en/tutorials/security/content-security-policy/#source-whitelists
	Io per ora ho definito giusto quelli che potevano servirmi, se pensate che ne possano essere utili altri sentitevi liberi di modificare il filtro CSPPolicyApplier come preferite.

    Altra nota: con l'applicazione di questi header, non è possibile inserire javascript embedded nell'html (con il tag <script></script>) nè tantomento è possibile usare stili
	embedded all'interno dell'html: in entrambi i casi vanno usati file separati.
	Infine, riguardo il primo caso, l'impossibilità di usare javascript embedded impedisce anche di usare le varie onLoad, ad esempio: <body onLoad="funzioneJavascript()">...</body>
	In questo caso, nel file javascript va usato un listener (window.onload, lo trovate usato in client.js) che definisce una procedura di attivazione sull'evento onload.