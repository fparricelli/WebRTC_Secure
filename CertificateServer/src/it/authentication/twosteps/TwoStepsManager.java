package it.authentication.twosteps;

import it.dao.DAOTrustedIPs;
import it.dao.DAOUsers;
import it.utility.MutableBoolean;
import it.utility.RandomStringGenerator;
import it.utility.mail.MailUtility;

public class TwoStepsManager {
	public static final Integer codeLength = 10;
	public static final String TWO_FACTORS_SUBJECT = "Confirm your access";
	public static final String TWO_FACTORS_BODY = "Please enter code: ";

	public static void sendMail(String username, String ip) throws Exception {

		MutableBoolean onceSent = new MutableBoolean(false);
		String mail = DAOUsers.getUserMail(username);
		String randomCode;
		
		if (!DAOTrustedIPs.validCodeExists(username, ip, onceSent)) {
			randomCode = RandomStringGenerator.randomString(codeLength);
			String completeBody = TWO_FACTORS_BODY + randomCode + "\n" + "IP: " + ip + "\n"
					+ "This code will expire in " + TwoStepsLogic.CODE_DURATION + " minutes.\n"
					+ "Don't recognize that access attempt?"+ "\n" + "Please send a mail to the contact center: "
					+ "securemessagingssd@gmail.com";
			if (!onceSent.isFlag()) {
				DAOTrustedIPs.insertCode(username, ip, randomCode);
				
			} else {
				DAOTrustedIPs.updateCode(username, ip, randomCode);

			}
			MailUtility.sendMail(mail, TWO_FACTORS_SUBJECT, completeBody);
		}
	}

}
