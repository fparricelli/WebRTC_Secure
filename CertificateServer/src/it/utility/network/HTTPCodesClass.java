package it.utility.network;

public class HTTPCodesClass {

	public static final Integer SUCCESS = 200;
	public static final Integer CONFLICT = 409;
	public static final Integer SERVER_ERROR = 500;
	public static final Integer UNAUTHORIZED = 401;
	public static final Integer NOT_FOUND = 404;
	public static final Integer BAD_REQUEST = 400;
	public static final Integer TIMEOUT = 408;
	public static final Integer FORBIDDEN = 403;
	public static final Integer TEMPORARY_REDIRECT = 307;
	/*
	 * Linee guida:
	 * 200 - Tutto a buon fine
	 * 409 - Ogni volta in cui l'azione del client andrebbe in conflitto con qualcosa presente nel 
	 * server. Ad esempio: voglio registrare uno username che è già presente.
	 * 500 - Eccezioni sollevate nel server, ad esempio dovute a una crittografia sbagliata del messaggio
	 * 401 - La richiesta è mal formata, ad esempio mancano dei parametri.
	 * 404 - 
	 * 400 -
	 * 408 - Un'informazione doveva essere mandata entro un certo tempo e non lo è stata
	 * 403 - Azione vietata. Ad esempio tentativo di accesso con IP e utente in account lock.
	 */
 }
