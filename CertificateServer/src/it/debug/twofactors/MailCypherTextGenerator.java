package it.debug.twofactors;

import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.security.AlgorithmParameters;
import java.util.Vector;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;

import it.sm.keystore.rsakeystore.RSADevice;
import it.sm.keystore.rsakeystore.RSASoftwareKeystore;

public class MailCypherTextGenerator {
	public static void main(String[] args) throws Exception {
		generateEncryptedMailCredentials();
		readEncryptedMailCredential();
	}

	public static void readEncryptedMailCredential() throws Exception {

		String name = null, password = null, url = null;
		RSADevice rsa = RSADevice.getInstance();
		String path = System.getenv("SECURE_MESSAGING_HOME");
		FileInputStream fileIn = new FileInputStream(path + "\\mail_place\\config.dat");
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
		String host;
		String starttls;
		String port;
		String auth;
		Vector<String> parameters = new Vector<String>();
		AlgorithmParameters parms = AlgorithmParameters.getInstance("AES");
		parms.init(new IvParameterSpec(iv));
		byte[] decrypted_session_key = rsa.decrypt(encrypted_session_key);
		SecretKey sessionKey = new SecretKeySpec(decrypted_session_key, 0, decrypted_session_key.length, "AES");
		Cipher aesCipher = Cipher.getInstance("AES/CBC/PKCS5PADDING");
		aesCipher.init(Cipher.DECRYPT_MODE, sessionKey, parms);
		name = (new String(aesCipher.doFinal(enc_user)));
		System.out.println(name);
		password = (new String(aesCipher.doFinal(enc_pwd)));
		System.out.println(password);
		host = (new String(aesCipher.doFinal(enc_host)));
		System.out.println(host);
		starttls =  (new String(aesCipher.doFinal(enc_starttls)));
		System.out.println(starttls);
		port = (new String(aesCipher.doFinal(enc_port)));
		System.out.println(port);
		auth = (new String(aesCipher.doFinal(enc_auth)));
		System.out.println(auth);
		parameters.add(url);
		parameters.add(name);
		parameters.add(password);

		objectIn.close();
		fileIn.close();
	}

	public static void generateEncryptedMailCredentials() throws Exception {
		RSASoftwareKeystore rsa = new RSASoftwareKeystore(".\\secure_place\\app_keystore.keystore", "secure_messaging",
				"changeit");
		String user = "securemessagingssd";
		String password = "progettofinalessd";

		FileOutputStream fout = new FileOutputStream("./mail_place/config.dat");
		ObjectOutputStream oos = new ObjectOutputStream(fout);
		// 1. Generate a session key
		KeyGenerator keyGen = KeyGenerator.getInstance("AES");
		keyGen.init(128);
		SecretKey sessionKey = keyGen.generateKey();
		// 2. Encrypt the session key with the RSA public key

		byte[] encryptedSessionKey = rsa.encrypt_public(sessionKey.getEncoded());

		// 3. Encrypt the data using the session key (unencrypted)
		Cipher aesCipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
		aesCipher.init(Cipher.ENCRYPT_MODE, sessionKey);// <-- sessionKey is the unencrypted
		// session key.
		String host = "smtp.gmail.com";
		// ... use aesCipher to encrypt your data
		byte[] enc_user = aesCipher.doFinal(user.getBytes());
		byte[] enc_pwd = aesCipher.doFinal(password.getBytes());

		// 4. Save the encrypted data along with the encrypted
		// session key (encryptedSessionKey).
		// PLEASE NOTE THAT BECAUSE OF THE ENCRYPTION MODE (CBC),
		// YOU ALSO NEED TO ALSO SAVE THE IV (INITIALIZATION VECTOR).
		Vector<byte[]> vector = new Vector<byte[]>();
		vector.add(0, enc_user);
		vector.add(1, enc_pwd);
		vector.add(2, encryptedSessionKey);
		byte[] iv = aesCipher.getParameters().getParameterSpec(IvParameterSpec.class).getIV();
		vector.add(3, iv);
		vector.add(4, aesCipher.doFinal(host.getBytes()));
		vector.add(5, aesCipher.doFinal("true".getBytes()));
		vector.add(6, aesCipher.doFinal("587".getBytes()));
		vector.add(7, aesCipher.doFinal("true".getBytes()));
		oos.writeObject(vector);
		oos.close();
		/*
		 * String host = "smtp.gmail.com"; props.put("mail.smtp.starttls.enable",
		 * "true"); props.put("mail.smtp.host", host); props.put("mail.smtp.user",
		 * receiver); props.put("mail.smtp.password", PASSWORD);
		 * props.put("mail.smtp.port", "587"); props.put("mail.smtp.auth", "true");
		 */

		// System.out.println("enc_user: " + enc_user);
		// System.out.println("enc_pwd: " + enc_pwd);
		// System.out.println("encryptedSessionKey" + encryptedSessionKey);
		// System.out.println("iv: " + iv);
		// aesCipher.init(Cipher.DECRYPT_MODE, sessionKey, aesCipher.getParameters());
		// System.out.println(new String(aesCipher.doFinal(enc_user)));
		// System.out.println(new String(aesCipher.doFinal(enc_pwd)));
	}
}
