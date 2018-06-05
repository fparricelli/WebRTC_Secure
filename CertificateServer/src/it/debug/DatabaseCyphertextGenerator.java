package it.debug;

import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.security.AlgorithmParameters;
import java.util.Arrays;
import java.util.Vector;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;

import it.sm.keystore.rsakeystore.RSASoftwareKeystore;
import it.utility.database.DatabaseUtility;

public class DatabaseCyphertextGenerator {
	public static byte[] enc_user_1;
	public static byte[] enc_user_2;
	public static byte[] enc_pwd_1;
	public static byte[] enc_pwd_2;
	public static byte[] session_1;
	public static byte[] session_2;
	public static byte[] iv_1;
	public static byte[] iv_2;
	public static byte[] dec_session_1;
	public static byte[] dec_session_2;
	public static SecretKey key_aes_1;
	public static SecretKey key_aes_2;
	public static AlgorithmParameters param_1;

	/*
	 * Questa classe serve a verificare il corretto funzionamento del processo di
	 * codifica/decodifica del password file del database per evitare l'hard coding
	 * delle password.
	 */
	public static void main(String[] args) {
	
		
		//firstAttempt();
		try {
			Vector<String> v = DatabaseUtility.getInstance().readParameters();
			System.out.println(v.get(0));
			System.out.println(v.get(1));
			System.out.println(v.get(2));
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

	}

	public static void readEncryptedFile() throws Exception {
		RSASoftwareKeystore rsa = new RSASoftwareKeystore(".\\secure_place\\app_keystore.keystore", "secure_messaging",
				"changeit");
		FileInputStream fileIn = new FileInputStream("./other_place/config.dat");
		ObjectInputStream objectIn = new ObjectInputStream(fileIn);
		Vector<byte[]> vector = (Vector<byte[]>) objectIn.readObject();
		// System.out.println(vector.size());
		String clear_user;
		String clear_pwd;
		// System.out.println(vector.get(0));
		byte[] enc_user = vector.get(0);
		byte[] enc_pwd = vector.get(1);
		byte[] encrypted_session_key = vector.get(2);
		byte[] iv = vector.get(3);
		byte[] url_enc = vector.get(4);
		enc_user_2 = enc_user;
		enc_pwd_2 = enc_pwd;
		session_2 = encrypted_session_key;
		iv_2 = iv;
		String url;
		// System.out.println(Arrays.equals(enc_user_1, enc_user_2));
		// System.out.println(Arrays.equals(enc_pwd_1, enc_pwd_2));
		System.out.println("Le chiavi AES codificate sono uguali? " + (Arrays.equals(session_1, session_2)));
		// System.out.println(Arrays.equals(iv_1, iv_2));
		AlgorithmParameters parms = AlgorithmParameters.getInstance("AES");
		parms.init(new IvParameterSpec(iv));
		byte[] decrypted_session_key = rsa.decrypt(encrypted_session_key);
		// System.out.println(decrypted_session_key);
		dec_session_2 = decrypted_session_key;

		System.out.println("Le chiavi AES decodificate sono uguali? " + Arrays.equals(dec_session_1, dec_session_2));
		SecretKey sessionKey = new SecretKeySpec(decrypted_session_key, 0, decrypted_session_key.length, "AES");
		key_aes_2 = sessionKey;
		Cipher aesCipher = Cipher.getInstance("AES/CBC/PKCS5PADDING");
		aesCipher.init(Cipher.DECRYPT_MODE, sessionKey, parms);
		System.out.println(new String(aesCipher.doFinal(enc_user)));
		System.out.println(new String(aesCipher.doFinal(enc_pwd)));
		url = new String(aesCipher.doFinal(url_enc));
		System.out.println(url);
		

		objectIn.close();

	}

	public static void generateEncryptedFile() throws Exception {
		RSASoftwareKeystore rsa = new RSASoftwareKeystore(".\\secure_place\\app_keystore.keystore", "secure_messaging",
				"changeit");
		String user = "ssluser";
		String password = "sslpassword";

		FileOutputStream fout = new FileOutputStream("./other_place/config.dat");
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
		String url1 = "jdbc:mysql://localhost:3306/secure_messaging";
		String url2 = "?verifyServerCertificate=true";
		String url3 = "&useSSL=true";
		String url4 = "&requireSSL=true";
		String url = url1+url2+url3+url4;
		vector.add(4, aesCipher.doFinal(url.getBytes()));
		oos.writeObject(vector);
		oos.close();

		// System.out.println("enc_user: " + enc_user);
		// System.out.println("enc_pwd: " + enc_pwd);
		// System.out.println("encryptedSessionKey" + encryptedSessionKey);
		// System.out.println("iv: " + iv);
		enc_user_1 = enc_user;
		enc_pwd_1 = enc_pwd;
		session_1 = encryptedSessionKey;
		dec_session_1 = sessionKey.getEncoded();
		key_aes_1 = sessionKey;
		iv_1 = iv;
		param_1 = aesCipher.getParameters();
		// aesCipher.init(Cipher.DECRYPT_MODE, sessionKey, aesCipher.getParameters());
		// System.out.println(new String(aesCipher.doFinal(enc_user)));
		// System.out.println(new String(aesCipher.doFinal(enc_pwd)));
	}

	public static void firstAttempt() {/*
										 * In linea di principio "avremmo" sostituito una password harcoded con un'altra
										 * password hardcoded: non sembrerebbe, a un primo sguardo, un modo sicuro di
										 * programmare. Possiamo però ipotizzare che tale password sia prelevata a sua
										 * volta da un mezzo elettronico sicuro (smartcard o equivalente), evitando quindi
										 * l'hardcoding.
										 * 
										 */
		RSASoftwareKeystore rsa = new RSASoftwareKeystore(".\\secure_place\\app_keystore.keystore", "secure_messaging",
				"changeit");
		try {
			System.out.println("prova");
			byte[] crypt = rsa.encrypt_public(("prova".getBytes()));
			System.out.println(crypt);
			String decrypt = new String(rsa.decrypt(crypt));
			System.out.println(decrypt);
			System.out.println("Le stringhe sono uguali? " + "prova".equals(decrypt));
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

}
