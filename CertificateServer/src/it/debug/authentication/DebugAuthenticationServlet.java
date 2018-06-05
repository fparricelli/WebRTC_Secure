package it.debug.authentication;

import java.io.ObjectInputStream;
import java.net.URL;
import java.net.URLEncoder;
import java.security.interfaces.RSAKey;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Vector;

import javax.net.ssl.HttpsURLConnection;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;

import it.authentication.AuthenticationLogic;
import it.dao.DAOIDS;
import it.sm.keystore.rsakeystore.RSADevice;
import it.utility.MutableBoolean;
import it.utility.MutableInteger;

public class DebugAuthenticationServlet {
	public static void main(String[] args) throws Exception {
		//authenticationExample();
		//blockedExample();
		//causeALockDown();
		//almostLockDown();
	//	createFailedLogins();
//testServlet("bob","password");
	/*	Vector<DebugThread> threads = new Vector<DebugThread>();
		Thread thread;
		for (int i=0; i<5; i++)
		{
			threads.add(new DebugThread());
		}
		
		for (int i=0; i<5; i++)
		{
			thread = new Thread(threads.get(i));
			thread.start();
		} */
	//	testServlet("Luca","Pirozzi");
		
/*		Vector<DebugThreadCorrectLogin> threads = new Vector<DebugThreadCorrectLogin>();
		Thread thread;
		for (int i=0; i<50; i++)
		{
			threads.add(new DebugThreadCorrectLogin());
		}
		
		for (int i=0; i<50; i++)
		{
		thread = new Thread(new DebugThreadCorrectLogin());
		thread.start();
		
		}
		*/
		
		createIPLockdownFromFailedLogins();
		
	}
		
		
	
	
	
	public static boolean createIPLockdownFromFailedLoginsTime () throws Exception
	{Boolean ipLocked;
	long starting;
	long ending;
	long interval;
	String ip = "127.0.0.1";
	String password = "passwordsbagliata";
	String username = "";
		for(int i=0; i<8; i++)
		{
			switch(i)
			{
		
			
			case 0:
			{
				username = new String ("paperino");
				break;
			}

			case 1:
			{
				username = new String("username");
				break;
			}
			case 2:
			{
				username = new String ("wewe");
				break;
			}
			
			case 3:
			{
				username = new String("topolino");
				break;
			}
			case 4:
			{
				username = new String("Luca");
				break;
			}
			case 5:
			{
				username = new String("linux");
				break;
			}
			case 6:
			{
				username = new String("pepp");
				break;
			}
			case 7:
			{
				username = new String("aldo");
				break;
			}
			}
			Boolean debug = true;
			for(int j=0; j<8; j++)
			{
				if(debug)
				{
				Thread.sleep(1000);
				}
				System.out.println("I: " + i + "J :" + j);
				System.out.println("USERNAME" + username);
				starting = System.nanoTime();
				testServlet(username, password);
				ending = System.nanoTime();
				interval = ending - starting;
				System.out.println("Elapsed Time: "  + ((double) ((double) interval/1000000))+ " ms");
				
			}
		}
		return DAOIDS.isIPLocked(ip, new MutableBoolean(false), new MutableBoolean(false), new MutableInteger());
	
	}
	
	public static boolean createIPLockdownFromFailedLogins () throws Exception
	{Boolean ipLocked;
	String ip = "127.0.0.1";
	String password = "passwordsbagliata";
	String username = "";
		for(int i=0; i<8; i++)
		{
			switch(i)
			{
		
			
			case 0:
			{
				username = new String ("paperino");
				break;
			}

			case 1:
			{
				username = new String("username");
				break;
			}
			case 2:
			{
				username = new String ("wewe");
				break;
			}
			
			case 3:
			{
				username = new String("topolino");
				break;
			}
			case 4:
			{
				username = new String("Luca");
				break;
			}
			case 5:
			{
				username = new String("linux");
				break;
			}
			case 6:
			{
				username = new String("pepp");
				break;
			}
			case 7:
			{
				username = new String("aldo");
				break;
			}
			}
			for(int j=0; j<8; j++)
			{
				//Thread.sleep(1000);
				System.out.println("I: " + i + "J :" + j);
				System.out.println("USERNAME" + username);
				testServlet(username, password);
			}
		}
		return DAOIDS.isIPLocked(ip, new MutableBoolean(false), new MutableBoolean(false), new MutableInteger());
	}
	public static void createFailedLogins () throws Exception
	{
		for (int i=0; i<3;i++)
		{
			testServlet("wewe3","passworddiscretamentesbagliata");
		}
	}
	
	public static void almostLockDown () throws Exception
	{
		for (int i=0; i<4; i++)
		{
			testServlet("username","passworddiscretamentesbagliata");
		}
		testServlet("username","password");
	}
	
	public static void causeALockDown () throws Exception
	{
		for (int i=0; i<5; i++)
		{
			testServlet("Luca","passwordanchesbagliata");
		}
	}
	
	public static void blockedExample() throws Exception
	{
		testServlet("wewe","passwordanchesbagliata");
	}
	public static void authenticationExample () throws Exception
	{
		
		HashMap<String,Object> map= new HashMap<String,Object>();
		String token;
		token = testServlet("username", "password");
		System.out.println(token);
		System.out.println(AuthenticationLogic.isValidToken(token, map ));
		System.out.println("USER: " + map.get("username") + " HOPS: " + map.get("hops"));
	testServlet("useracaso", "passwordchenondovrebbeesseregiusta");
		testServlet("wewe","passwordanchesbagliata");
	}
	
	public static void decryptToken (String token) throws IllegalArgumentException, Exception
	{
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
public static String testServlet (String usr, String pwd) throws Exception
{
	
	
		HttpsURLConnection.setDefaultHostnameVerifier((hostname, session) -> true);
		URL url = new URL("https://localhost:8443/CertificateServer/authenticate");
		Map<String, Object> params = new LinkedHashMap<>();
		byte[] data;
		HashMap<String, String> parameters;
		params.put("username", usr);
		params.put("password", pwd);
		String token = null;
		StringBuilder postData = new StringBuilder();
		for (Map.Entry<String, Object> param : params.entrySet()) {
			if (postData.length() != 0)
				postData.append('&');
			postData.append(URLEncoder.encode(param.getKey(), "UTF-8"));
			postData.append('=');
			postData.append(URLEncoder.encode(String.valueOf(param.getValue()), "UTF-8"));
		}
		byte[] postDataBytes = postData.toString().getBytes("UTF-8");

		HttpsURLConnection conn = (HttpsURLConnection) url.openConnection();
		conn.setRequestMethod("POST");
		conn.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");
		conn.setRequestProperty("Content-Length", String.valueOf(postDataBytes.length));
		conn.setDoOutput(true);
		conn.getOutputStream().write(postDataBytes);
		
		System.out.println("HTTP CODE :" + conn.getResponseCode());
		if(conn.getResponseCode()==200)
		{
		ObjectInputStream in = new ObjectInputStream(conn.getInputStream());
	parameters= (HashMap<String,String>)in.readObject();
		token = parameters.get("token");
		System.out.println(parameters.get("token"));
		System.out.println(parameters.get("telephone"));
		System.out.println(parameters.get("name"));
		System.out.println(parameters.get("surname"));
		System.out.println(parameters.get("role"));
		}
		return token;
	

}

}