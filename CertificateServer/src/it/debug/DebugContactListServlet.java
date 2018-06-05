package it.debug;

import java.io.DataOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.URL;

import javax.net.ssl.HostnameVerifier;
import javax.net.ssl.HttpsURLConnection;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;

import org.w3c.dom.Document;

public class DebugContactListServlet {

	
	public static void main(String[] args) {
		
		
		test1();
	}
	
	
	
	private static int testContactList(String lista, String ruolo, String url) {
		
		 HttpsURLConnection.setDefaultHostnameVerifier(
				    new HostnameVerifier(){

				        public boolean verify(String hostname,
				                javax.net.ssl.SSLSession sslSession) {
				            if (hostname.equals("localhost")) {
				                return true;
				            }
				            return false;
				        }
				    });
		
		try {
		
		

		URL myurl = new URL(url);
		HttpsURLConnection con = (HttpsURLConnection)myurl.openConnection();
		con.setRequestMethod("POST");
		
		String query = "list="+lista+"&ruolo="+ruolo;

		con.setDoOutput(true); 
		con.setDoInput(true);
		
		DataOutputStream output = new DataOutputStream(con.getOutputStream());  

		output.writeBytes(query);
		output.flush();
		output.close();

		int respCode =  con.getResponseCode();
		
		
		if(respCode == 200) {
		
			
		String val = con.getHeaderField("NewToken");	
	        
	    System.out.println("Token:"+val); 
			
		
		File f = new File("./lista.xml");
		FileOutputStream fos = new FileOutputStream(f);
		InputStream is = con.getInputStream();
		
		
		    byte[] buffer = new byte[4096];
		    int length;
		    while ((length = is.read(buffer)) != -1) {
		        fos.write(buffer, 0, length);
		    }
		    fos.flush();
		    fos.close();
		    is.close();
		       
		}
		
		return respCode;
		
		}catch(Exception e) {
			e.printStackTrace();
			return -1;
		}
	}
	
	private static String getRootFromXML(File f) {
		try {
		
		DocumentBuilderFactory dbFactory = DocumentBuilderFactory.newInstance();
		DocumentBuilder dBuilder = dbFactory.newDocumentBuilder();
		Document doc = dBuilder.parse(f);
		
		doc.getDocumentElement().normalize();
		
		return doc.getDocumentElement().getNodeName();
		
		}catch(Exception e) {
			e.printStackTrace();
			return null;
		}
	}

	private static void test1() {
				//TEST #1
				//Richiedo lista admin, sono ruolo = admin (permit)
				String httpsURL = "https://localhost:8443/CertificateServer/contact-lists/admins/admin-list.xml";
				int resp1 = testContactList("admins", "admin", httpsURL);
				//Mi aspetto response code = 200 (ok) e di trovare nel file scaricato i contatti admin
				System.out.println("Test #1 - Response code:"+resp1);
				File f1 = new File("./lista.xml");
				System.out.println("Test #1 - File:"+f1.getName()+" esiste:"+f1.exists());
				
				//Controllo se la lista che ho richiesto è quella che volevo
				//Mi aspetto che il root element sia AdminContactList
				String rootElem = getRootFromXML(f1);
				System.out.println("Test #1 - Elemento root:"+rootElem+"\n");
				//Cancello file per i test successivi
				f1.delete();
				
	}
	
	
	@SuppressWarnings("unused")
	private static void test2() {
				//TEST #2
				//Richiedo lista admin, sono utente (deny)
				String httpsURL2 = "https://localhost:8443/CertificateServer/contact-lists/admins/admin-list.xml";
				int resp2 = testContactList("admins", "utente", httpsURL2);
				//Mi aspetto response code = 401 (unauthorized)
				System.out.println("Test #2 - Response code:"+resp2+"\n");
	
	}
	
	
	@SuppressWarnings("unused")
	private static void test3() {
				//TEST #3
				//Richiedo lista non riconosciuta, con utente riconosciuto (tramite parametri post)
				String httpsURL3 = "https://localhost:8443/CertificateServer/contact-lists/admins/admin-list.xml";
				int resp3 = testContactList("listanonriconosciuta", "admin", httpsURL3);
				//Mi aspetto response code = 400 (bad request)
				System.out.println("Test #3 - Response code:"+resp3+"\n");
	}
	
	@SuppressWarnings("unused")
	private static void test4() {
				//TEST #4
				//Richiedo lista riconosciuta, con utente non riconosciuto (tramite parametri post)
				String httpsURL4 = "https://localhost:8443/CertificateServer/contact-lists/admins/admin-list.xml";
				int resp4 = testContactList("admins", "utenteacaso", httpsURL4);
				//Mi aspetto response code = 400 (bad request)
				System.out.println("Test #4 - Response code:"+resp4+"\n");
	}
	
	@SuppressWarnings("unused")
	private static void test5() {
				//TEST #5
				//Richiedo lista non riconosciuta e utente non riconosciuto (tramite parametri post)
				String httpsURL5 = "https://localhost:8443/CertificateServer/contact-lists/admins/admin-list.xml";
				int resp5 = testContactList("listaacaso", "utenteacaso", httpsURL5);
				//Mi aspetto response code = 400 (bad request)
				System.out.println("Test #5 - Response code:"+resp5+"\n");
	}
	
}
