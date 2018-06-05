package it.websocket.comm;

import java.io.BufferedInputStream;
import java.io.BufferedReader;
import java.io.FileInputStream;
import java.io.FileReader;
import java.net.URI;
import java.security.MessageDigest;

import javax.servlet.ServletConfig;

import org.json.JSONObject;

import java.util.Base64;
import java.util.concurrent.Semaphore;
import java.util.concurrent.locks.Lock;

public class WSHelper {
	
	public final static String path = "/WEB-INF/secure_place/secure_key.txt";
	private final String s_server = "wss://localhost:12345";
	private ServletConfig config;
	private Semaphore sem;
	
	
	public WSHelper(ServletConfig config, Semaphore sem) {
		this.config = config;	
		this.sem = sem;
	}
	
	
	
	public void contactSignalingServer(String username, String token, int roleNumber) throws Exception{
		
		JSONObject msg = new JSONObject();
		msg.put("type", "tomcat_msg");
		msg.put("name", username);
		msg.put("token", token);
		msg.put("roleNumber", roleNumber);
		
		String hash = calculateHashValue();
		
		msg.put("hash", hash);
		WSClient ws = new WSClient(new URI(s_server), msg);
		ws.connect();	
		
	}
	
	
	private String calculateHashValue() throws Exception {
		
		String f_path = this.config.getServletContext().getRealPath(path);
		
		sem.acquire();
		
		byte[] buffer= new byte[8192];
		int count = 0;		
		
		MessageDigest digest = MessageDigest.getInstance("SHA-256");
		BufferedInputStream bis = new BufferedInputStream(new FileInputStream(f_path));
		while ((count = bis.read(buffer)) > 0) {
			digest.update(buffer, 0, count);
		}
		bis.close();
		
		String readValue = new String(buffer);
		System.out.println("[HASH CHECK] Leggo da file:"+readValue);
		byte[] hash = digest.digest();
		String my_hash = new String(Base64.getEncoder().encode(hash));
		
		
		sem.release();
		
		
		return my_hash;
			
	}
	
	
	
	
	

}
