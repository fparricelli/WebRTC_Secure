package it.registration;

import java.sql.SQLException;

import org.mindrot.jbcrypt.BCrypt;

import it.dao.DAOUsers;
import it.exception.registration.MailAlreadyExistsException;
import it.exception.registration.TelephoneAlreadyExistsException;
import it.exception.registration.UserAlreadyExistsException;

public class RegistrationLogic {
	// Rounds determina il numero di passaggi hash da effettuare. 10 è considerato
	// abbastanza sicuro, 12 molto.
	// Il massimo è 30 ma il tempo aumenta esponenzialmente ad ogni passaggio: già
	// 15 richiede molto tempo, 20 tantissimo.
	private static Integer rounds = 12;

	public static void store(String username, String password, String mail, String name, String surname,
			Integer telephone) throws SQLException, UserAlreadyExistsException, MailAlreadyExistsException,
			TelephoneAlreadyExistsException {

		if (DAOUsers.usernameAlreadyTaken(username)) {
			throw new UserAlreadyExistsException();
		} else if (DAOUsers.mailAlreadyTaken(mail)) {
			throw new MailAlreadyExistsException();
		} else if (DAOUsers.telephoneAlreadyTaken(telephone)) {
			throw new TelephoneAlreadyExistsException();
		} else {
			String bcrypted = BCrypt.hashpw(password, BCrypt.gensalt(rounds));
			DAOUsers.store(username, bcrypted, mail, name, surname, telephone);
		}
	}

}
