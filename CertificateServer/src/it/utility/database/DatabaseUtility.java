package it.utility.database;

import java.io.FileInputStream;
import java.io.ObjectInputStream;
import java.security.AlgorithmParameters;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Vector;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;

import it.sm.keystore.rsakeystore.RSADevice;

public class DatabaseUtility {
	// TODO PER AUMENTARE LE PRESTAZIONI FORSE CONVIENE ESTRARRE LE CREDENZIALI UNA
	// SOLA VOLTA
	private static DatabaseUtility instance;

	public static DatabaseUtility getInstance() {
		if (instance == null) {
			synchronized (DatabaseUtility.class) {
				DatabaseUtility inst = instance;
				if (inst == null) {
					synchronized (DatabaseUtility.class) {
						try {
							instance = new DatabaseUtility();
						} catch (ClassNotFoundException e) {
							// TODO Auto-generated catch block
							e.printStackTrace();
						}
					}
				}
			}
		}
		return instance;
	}

	private DatabaseUtility() throws ClassNotFoundException {
		Class.forName("com.mysql.jdbc.Driver");
	}

	public Connection connect() {
		Connection con = null;
		try {
			Vector<String> parameters = readParameters();

			String url = parameters.get(0);
			String user = parameters.get(1);
			String password = parameters.get(2);
			con = DriverManager.getConnection(url, user, password);

		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return con;
	}

	public DatabaseTriple query(String command) throws SQLException {
		Connection conn = null;
		PreparedStatement statement = null;
		ResultSet result = null;
		
			conn = this.connect();
			statement = conn.prepareStatement(command);
			result = statement.executeQuery();
		 
		return new DatabaseTriple(conn, statement, result);
	}

	/*
	 * public static void generatePasswordFile () throws NoSuchAlgorithmException,
	 * NoSuchPaddingException, InvalidKeyException, IllegalBlockSizeException,
	 * BadPaddingException { KeyGenerator keygen = KeyGenerator.getInstance("AES");
	 * SecretKey aesKey = keygen.generateKey(); Cipher aesCipher =
	 * Cipher.getInstance("AES/ECB/PKCS5Padding");
	 * aesCipher.init(Cipher.ENCRYPT_MODE, aesKey); byte[] cleartext =
	 * "ssluser".getBytes(); byte[] cleartext2 = "sslpassword".getBytes(); byte[]
	 * ciphertext = aesCipher.doFinal(cleartext); byte[] ciphertext2 =
	 * aesCipher.doFinal(cleartext2); aesCipher.init(Cipher.DECRYPT_MODE, aesKey);
	 * cleartext = aesCipher.doFinal(ciphertext); cleartext2 =
	 * aesCipher.doFinal(ciphertext2); System.out.println(ciphertext);
	 * System.out.println(ciphertext2); String stringa = new String(cleartext);
	 * String stringa2 = new String(cleartext2); System.out.println(cleartext);
	 * System.out.println(cleartext2); }
	 * 
	 */

	public Vector<String> readParameters() throws Exception {
		/*
		 * In linea di principio "avremmo" sostituito una password harcoded con un'altra
		 * password hardcoded: non sembrerebbe, a un primo sguardo, un modo sicuro di
		 * programmare. Possiamo per� ipotizzare che tale password sia prelevata a sua
		 * volta da un mezzo elettronico sicuro (smartcard o equivalente), evitando
		 * quindi l'hardcoding.
		 * 
		 */
	

		String name = null, password = null, url = null;
		RSADevice rsa = RSADevice.getInstance();
		String path;
		FileInputStream fileIn;
		path = System.getenv("SECURE_MESSAGING_HOME");
		if(!System.getProperty("os.name").toLowerCase().contains("mac")) {
			 fileIn = new FileInputStream(path + "\\other_place\\config.dat");
		}
		else {
			 fileIn = new FileInputStream(path + "/other_place/config.dat");
		}
		ObjectInputStream objectIn = new ObjectInputStream(fileIn);
		@SuppressWarnings("unchecked")
		Vector<byte[]> vector = (Vector<byte[]>) objectIn.readObject();
		byte[] enc_user = vector.get(0);
		byte[] enc_pwd = vector.get(1);
		byte[] encrypted_session_key = vector.get(2);
		byte[] iv = vector.get(3);
		byte[] url_enc = vector.get(4);
		Vector<String> parameters = new Vector<String>();
		AlgorithmParameters parms = AlgorithmParameters.getInstance("AES");
		parms.init(new IvParameterSpec(iv));
		byte[] decrypted_session_key = rsa.decrypt(encrypted_session_key);
		SecretKey sessionKey = new SecretKeySpec(decrypted_session_key, 0, decrypted_session_key.length, "AES");
		Cipher aesCipher = Cipher.getInstance("AES/CBC/PKCS5PADDING");
		aesCipher.init(Cipher.DECRYPT_MODE, sessionKey, parms);
		name = (new String(aesCipher.doFinal(enc_user)));
		password = (new String(aesCipher.doFinal(enc_pwd)));
		url = new String(aesCipher.doFinal(url_enc));
		parameters.add(url);
		parameters.add(name);
		parameters.add(password);

		objectIn.close();
		fileIn.close();
		return parameters;
	}

}
