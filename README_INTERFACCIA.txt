	Scenario di utilizzo
	(Utente A)
	=> Visito login.html, faccio login con un utente con ruolo: utente
	=> nella pagina contacts.html vado su Contatta Tecnico
	=> mi si apre la pagina di index_chat.html (sono online)
	
	(Utente B)
	=> visito login.html, faccio login con un utente con ruolo: tecnico
	=> nella pagina contacts.html vado su Contatta Tecnico
	=> mi si apre la pagina di index_chat.html (sono online)
	
	(Utente A)
	=> clicco sul nome dell'utente B e su 'Contatta'
	=> parlo con Utente B
	
	
	Nota bene: l'utente viene considerato 'online' quando si trova sulla pagina index_chat.html (in generale, se mi sposto da index_chat.html la connessione viene chiusa)
	Finchè sta su contacts.html, non viene considerato online (per la chat).
	Questo può facilmente essere corretto in fase di stesura delle interfacce: nella pagina contacts infatti io non faccio altro che passare un parametro
	(tramite session storage) relativo alla lista scelta (in base al bottone premuto: Contatta Admin, Tecnico, Utente) che poi verrà recuperato nella pagina index_chat.html.
	Poi, all'on-load della pagina index_chat.html, uso una funzione (retrieveContactList) che si legge questo parametro e recupera la lista specificata.
	
	L'idea potrebbe essere quella di unire in un'unica interfaccia la pagina contacts.html e index_chat.html, facendo in modo che:
		=> prima l'utente seleziona con chi parlare (tecnico, admin, utente)
		=> poi quando ha fatto, questo scatena il caricamento della lista nella tabella
		=> da lì, l'utente sceglie normalmente con chi parlare
		