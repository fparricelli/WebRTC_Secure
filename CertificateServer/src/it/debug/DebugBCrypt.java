package it.debug;

import org.mindrot.jbcrypt.BCrypt;

public class DebugBCrypt {

	public static void main(String[] args) {
		/*
		 * Secondo gli esperti del settore si ha una buona sicurezza per valori di log_rounds 10-12, e dalle prove
		 * emerge che da laptop 10 viene eseguito molto velocemente, 12 abbastanza più lento.
		 * Il valore massimo è 30.
		 */
		int log_rounds = 12;
		String password = "pizza100";
		String hashed = BCrypt.hashpw(password, BCrypt.gensalt(log_rounds));
		String hashed2 = BCrypt.hashpw(password, BCrypt.gensalt(log_rounds));
		
		/*
		 * Mi assicuro che gli hash siano diversi: questo perché BCrypt genera da sè i salt
		 */
		System.out.println(!hashed.equals(hashed2));
		/*
		 * Provo a generare due hash bcrypt della stessa password per vedere se vengono riconosciuti
		 * entrambi come hash della stessa password (mi attendo true, true alla fine)
		 */
		System.out.println(BCrypt.checkpw(password, hashed));
		System.out.println(BCrypt.checkpw(password, hashed2));

	}

}
