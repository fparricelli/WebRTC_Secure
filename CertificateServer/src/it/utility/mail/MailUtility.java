package it.utility.mail;

import java.io.FileInputStream;
import java.io.ObjectInputStream;
import java.security.AlgorithmParameters;
import java.util.HashMap;
import java.util.Properties;
import java.util.Vector;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.AddressException;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;

import it.sm.keystore.rsakeystore.RSADevice;

public class MailUtility {
	private static MailUtility instance;

	private MailUtility() {

	}

	public static MailUtility getInstance() {
		if (instance == null) {
			synchronized (MailUtility.class) {
				MailUtility inst = instance;
				if (inst == null) {
					synchronized (MailUtility.class) {
						instance = new MailUtility();
					}
				}
			}
		}
		return instance;
	}

	public static void sendMail(String[] receivers, String object, String content) throws Exception {
		HashMap<String, String> parameters = readParameters();
		handleSMTP(receivers, object, content,parameters);
	}
	
	public static void sendMail(String receiver, String object, String content) throws Exception
	{
		String[] receivers = {receiver};
		sendMail(receivers, object, content);
	}
 
	private static HashMap<String, String> readParameters() throws Exception {
		HashMap<String, String> parameters = new HashMap<String, String>();
		RSADevice rsa = RSADevice.getInstance();
		String path;
		FileInputStream fileIn;
		 path = System.getenv("SECURE_MESSAGING_HOME");
		if(!System.getProperty("os.name").toLowerCase().contains("mac")) {
			 fileIn = new FileInputStream(path + "\\mail_place\\config.dat");
		}
		else {
			 fileIn = new FileInputStream(path + "/mail_place/config.dat");
		}
		ObjectInputStream objectIn = new ObjectInputStream(fileIn);
		@SuppressWarnings("unchecked")
		Vector<byte[]> vector = (Vector<byte[]>) objectIn.readObject();
		byte[] enc_user = vector.get(0);
		byte[] enc_pwd = vector.get(1);
		byte[] encrypted_session_key = vector.get(2);
		byte[] iv = vector.get(3);
		byte[] enc_host = vector.get(4);
		byte[] enc_starttls = vector.get(5);
		byte[] enc_port = vector.get(6);
		byte[] enc_auth = vector.get(7);
		String username;
		String password;
		String host;
		String starttls;
		String port;
		String auth;
		AlgorithmParameters parms = AlgorithmParameters.getInstance("AES");
		parms.init(new IvParameterSpec(iv));
		byte[] decrypted_session_key = rsa.decrypt(encrypted_session_key);
		SecretKey sessionKey = new SecretKeySpec(decrypted_session_key, 0, decrypted_session_key.length, "AES");
		Cipher aesCipher = Cipher.getInstance("AES/CBC/PKCS5PADDING");
		aesCipher.init(Cipher.DECRYPT_MODE, sessionKey, parms);
		username = (new String(aesCipher.doFinal(enc_user)));
		password = (new String(aesCipher.doFinal(enc_pwd)));
		host = (new String(aesCipher.doFinal(enc_host)));
		starttls = (new String(aesCipher.doFinal(enc_starttls)));
		port = (new String(aesCipher.doFinal(enc_port)));
		auth = (new String(aesCipher.doFinal(enc_auth)));
		parameters.put("username", username);
		parameters.put("password", password);
		parameters.put("mail.smtp.starttls.enable", starttls);
		parameters.put("mail.smtp.host", host);
		parameters.put("mail.stmp.port", port);
		parameters.put("mail.smtp.auth", auth);
		
		
		objectIn.close();
		return parameters;
	}

	public static void handleSMTP(String[] receivers,String object, String content, HashMap<String, String> parameters) {
		
		String username = parameters.get("username");
		String password = parameters.get("password");
		String host = parameters.get("mail.smtp.host");
		String starttls = parameters.get("mail.smtp.starttls.enable");
		String port = parameters.get("mail.stmp.port");
		String auth = parameters.get("mail.smtp.auth");
		Properties props = System.getProperties();
        props.put("mail.smtp.starttls.enable", starttls);
        props.put("mail.smtp.host", host);
        props.put("mail.smtp.user", receivers);
        props.put("mail.smtp.password", password);
        props.put("mail.smtp.port", port);
        props.put("mail.smtp.auth", auth);
        Session session = Session.getDefaultInstance(props);
        MimeMessage message = new MimeMessage(session);

        try {
            message.setFrom(new InternetAddress(username));
            InternetAddress[] toAddress = new InternetAddress[receivers.length];

            // To get the array of addresses
            for( int i = 0; i < receivers.length; i++ ) {
                toAddress[i] = new InternetAddress(receivers[i]);
            }

            for( int i = 0; i < toAddress.length; i++) {
                message.addRecipient(Message.RecipientType.TO, toAddress[i]);
            }

            message.setSubject(object);
            message.setText(content);
            Transport transport = session.getTransport("smtp");
            transport.connect(host, username, password);
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
