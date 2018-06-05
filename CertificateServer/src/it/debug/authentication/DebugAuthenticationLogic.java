package it.debug.authentication;

import java.io.FileInputStream;
import java.security.Key;
import java.security.KeyStore;
import java.security.interfaces.RSAKey;
import java.sql.SQLException;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Vector;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;

import it.accessControl.IDS;
import it.authentication.AuthenticationLogic;
import it.authentication.twosteps.TwoStepsManager;
import it.exception.authentication.LockedIP;
import it.exception.authentication.LockedUser;
import it.exception.authentication.NoSuchUserException;
import it.sm.keystore.rsakeystore.RSADevice;
import it.sm.keystore.rsakeystore.RSASoftwareKeystore;
import it.utility.MutableBoolean;
import it.utility.MutableInteger;
import it.utility.database.DatabaseUtility;

public class DebugAuthenticationLogic {

	public static void main(String[] args) {
		

		// checkBCrypt();
		// tryToken();
		// tokenExample();
		// tokenExample2();
		/*
		 * Boolean result2 = false; String token =
		 * DebugAuthenticationServlet.testServlet("Luca", "Pirozzi"); String token2;
		 * System.out.println(token); token2 = AuthenticationLogic.regenToken(token);
		 * String token3; token3 = AuthenticationLogic.regenToken(token2);
		 * System.out.println("TOKEN RIGENERATO: " + token);
		 * System.out.println("I token sono diversi? " + Objects.equals(token, token2));
		 * boolean result = true; System.out.println("MI ASPETTO FALSE : " +
		 * TokenUtility.compareTokens(token, token2)); result = true;
		 * System.out.println("MI ASPETTO TRUE : " + TokenUtility.compareTokens(token,
		 * token)); token2 = new String(token); System.out.println("MI ASPETTO TRUE : "
		 * + TokenUtility.compareTokens(token, token2));
		 * System.out.println("MI ASPETTO FALSE : " + TokenUtility.compareTokens(token3,
		 * token)); token = AuthenticationLogic.generateToken("Luca", 10, "127.0.0.1");
		 * result2 = AuthenticationLogic.isValidToken(token, "127.0.0.1", new
		 * HashMap<String,Object> ()); System.out.println("MI ASPETTO TRUE: " +
		 * result2); result2 = AuthenticationLogic.isValidToken(token, "130.0.0.1", new
		 * HashMap<String,Object> ()); System.out.println("MI ASPETTO FALSE: " +
		 * result2);
		 */
		
		
		class DebugAuthLogicThread implements Runnable {
			Vector<Double> times = new Vector<Double>();
			Double average = new Double(0);
			@Override
			public void run() {
				try {
					for (int i=0; i<10; i++)
					{
					long starting,ending, interval;
					starting = System.nanoTime();
					String username = "username";
					String password = "password";
					MutableBoolean needsUpdate = new MutableBoolean(false);
					MutableBoolean lockTimeout = new MutableBoolean(false);
					MutableInteger failed_account_attempts = new MutableInteger();
					HashMap<String, String> returnParameters = new HashMap<String, String>();
					synchronized (DatabaseUtility.class) {
						if (IDS.isIPLocked("127.0.0.1", needsUpdate, lockTimeout, failed_account_attempts)) {
							throw new LockedIP();
						}
						if (IDS.isLockedOut("username", "127.0.0.1")) {
							System.out.println("Account is locked");
							throw new LockedUser();
						}
						Boolean authenticated = AuthenticationLogic.authenticate(username, password);
						if (authenticated) {
							if (AuthenticationLogic.isTrusted(username, "127.0.0.1")) {
								System.out.println("IP TRUSTED");
								AuthenticationLogic.deleteFailedLogins(username, "127.0.0.1");
								String authenticationToken = AuthenticationLogic.generateAuthenticationToken(username,
										"127.0.0.1");
								System.out.println("[Server]Auth token:" + authenticationToken);
								returnParameters.put("token", authenticationToken);
								returnParameters.putAll(AuthenticationLogic.getUserDetails(username));
							} else {
								System.out.println("IP NOT TRUSTED");
								TwoStepsManager.sendMail(username, "127.0.0.1");
							}

						} else {

							AuthenticationLogic.handleFailedLogin(username, "127.0.0.1", needsUpdate, lockTimeout,
									failed_account_attempts);

						}

						ending = System.nanoTime();
						interval = ending - starting;
						System.out.println("Interval: " + interval);
						times.add((Double) ((double)(interval))/1000000);
						
					}
					
				
					}
					for (int i=0; i<times.size(); i++)
					{
						System.out.println("GET: " + times.get(i));
						average+= times.get(i);
					}
					average = average/times.size();
					System.out.println("Tempo medio: " + average + " ms");
				}

				catch (Exception e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}

			}
			

		}
		Vector<DebugAuthLogicThread> vector = new Vector<DebugAuthLogicThread>();
		for (int i=0; i< 100; i++)
		{
			vector.add(new DebugAuthLogicThread());
		}
		
		for (int i=0; i<100; i++)
		{
			Thread thread = new Thread(vector.get(i));
			thread.start();
		}
	}

	public static void tokenExample2() throws Exception {
		String token = AuthenticationLogic.generateToken("username", 10);
		System.out.println(AuthenticationLogic.isValidToken(token, new HashMap<>()));
	}

	public static void tokenExample() throws Exception {
		String token = AuthenticationLogic.generateToken("username", 10);
		String alias = "secure_messaging";
		Algorithm algo = Algorithm.RSA512((RSAKey) RSADevice.getInstance().extractPublicKey());

		JWTVerifier verifier = JWT.require(algo).withIssuer(alias).build(); // Reusable verifier instance
		DecodedJWT jwt = verifier.verify(token);
		System.out.println((jwt.getIssuer()));
		System.out.println(jwt.getIssuedAt());
		System.out.println(jwt.getExpiresAt());
		System.out.println(jwt.getClaims().get("username").asString());
	}

	@SuppressWarnings("unchecked")
	public static void tryToken() throws Exception {
		String username = "username";
		String token = null;
		String alias = "secure_messaging";
		String password = "changeit";
		String keystorePath = ".\\secure_place\\app_keystore.keystore";
		@SuppressWarnings("rawtypes")
		Map<String, Object> attributes = new HashMap();
		FileInputStream fis = new FileInputStream(keystorePath);
		KeyStore ks = KeyStore.getInstance(KeyStore.getDefaultType());
		ks.load(fis, password.toCharArray());
		Key key = ks.getKey(alias, password.toCharArray());
		Algorithm algo = Algorithm.RSA512((RSAKey) key);
		attributes.put("username", username);
		Integer secMill = 1000;
		Integer minSec = 60;
		token = JWT.create().withClaim("username", username).withIssuer(alias)
				.withIssuedAt(new Date(System.currentTimeMillis()))
				.withExpiresAt(new Date(System.currentTimeMillis() + 15 * secMill * minSec)).sign(algo);
		algo = Algorithm.RSA512((RSAKey) new RSASoftwareKeystore(keystorePath, alias, password).extractPublicKey());
		JWTVerifier verifier = JWT.require(algo).withIssuer(alias).build(); // Reusable verifier instance
		DecodedJWT jwt = verifier.verify(token);
		System.out.println((jwt.getIssuer()));
		System.out.println(jwt.getIssuedAt());
		System.out.println(jwt.getExpiresAt());
		System.out.println(jwt.getClaims().get("username").asString());
		// System.out.println(token);
	}

	public static void checkBCrypt() throws SQLException {
		/*
		 * Assicurarsi di aver importato il database.sql e che sia popolato con gli
		 * stessi valori, altrimenti non funziona
		 */

		boolean bool;
		try {
			bool = AuthenticationLogic.authenticate("username", "password");
			System.out.println(bool);
			bool = AuthenticationLogic.authenticate("wewe2", "questaèunapassword2");
			System.out.println(bool);
			bool = !AuthenticationLogic.authenticate("Questo", "Questo");
			System.out.println(bool);
			bool = !AuthenticationLogic.authenticate("wewe", "passwordacaso");
			System.out.println(bool);
		} catch (NoSuchUserException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
}