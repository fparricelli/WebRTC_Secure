package it.debug.twofactors;

import java.security.SecureRandom;
import java.util.Properties;

import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.AddressException;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;

import it.authentication.twosteps.TwoStepsLogic;
import it.utility.mail.MailUtility;

public class DebugTwoFactors {
	public static void main(String[] args) throws Exception {
		//sendMail("luca.pirozzi2@gmail.com","OGGETTO DELLA MAIL","Codice: " + randomString(10));
	//sendMail2("luca.pirozzi2@gmail.com","Conferma accesso", "Codice " + randomString(10));
		//System.out.println(org.apache.commons.codec.digest.DigestUtils.sha256Hex("ZAYnvkbZe8"));
		//boolean result = TwoFactorsLogic.isCodeRight("Luca", "127.0.0.1", "ZAYnvkbZe8");
		//System.out.println(result);
		boolean result = TwoStepsLogic.handleCode("Luca", "127.0.0.1", "ZAYnvkbZe8");
		System.out.println(result);
	}
	
	public static void sendMail2(String receiver, String object, String content) throws Exception
	{
		String[] receivers = {receiver};
		MailUtility.getInstance().sendMail(receivers, object, content);
	}
	static final String AB = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
	static SecureRandom rnd = new SecureRandom();

	public static String randomString( int len ){
	   StringBuilder sb = new StringBuilder( len );
	   for( int i = 0; i < len; i++ ) 
	      sb.append( AB.charAt( rnd.nextInt(AB.length()) ) );
	   return sb.toString();
	}
	
	public static void sendMail (String receiver, String subject, String content)
	{
		  String USER_NAME = "securemessagingssd";  // GMail user name (just the part before "@gmail.com")
		   String PASSWORD = "progettofinalessd"; // GMail password
		   String[] to = {receiver};
				   Properties props = System.getProperties();
	        String host = "smtp.gmail.com";
	        props.put("mail.smtp.starttls.enable", "true");
	        props.put("mail.smtp.host", host);
	        props.put("mail.smtp.user", receiver);
	        props.put("mail.smtp.password", PASSWORD);
	        props.put("mail.smtp.port", "587");
	        props.put("mail.smtp.auth", "true");

	        Session session = Session.getDefaultInstance(props);
	        MimeMessage message = new MimeMessage(session);

	        try {
	            message.setFrom(new InternetAddress(USER_NAME));
	            InternetAddress[] toAddress = new InternetAddress[to.length];

	            // To get the array of addresses
	            for( int i = 0; i < to.length; i++ ) {
	                toAddress[i] = new InternetAddress(to[i]);
	            }

	            for( int i = 0; i < toAddress.length; i++) {
	                message.addRecipient(Message.RecipientType.TO, toAddress[i]);
	            }

	            message.setSubject(subject);
	            message.setText(content);
	            Transport transport = session.getTransport("smtp");
	            transport.connect(host, USER_NAME, PASSWORD);
	            transport.sendMessage(message, message.getAllRecipients());
	            transport.close();
	        }
	        catch (AddressException ae) {
	            ae.printStackTrace();
	        }
	        catch (MessagingException me) {
	            me.printStackTrace();
	        }
	    }
	
	
}
