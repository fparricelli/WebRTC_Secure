package it.debug;

import java.net.URL;

import javax.net.ssl.HostnameVerifier;
import javax.net.ssl.HttpsURLConnection;

public class DebugInterceptorFilter {
	
	public static void main(String[] args) {
		
		//Testo con un URL che deve essere filtrato
		String httpsURL = "https://localhost:8443/CertificateServer/policy/accessPolicy.xml";
		int resp1 = testIntercepting(httpsURL);
		//Mi aspetto codice 401 (unauthorized)
		System.out.println("Test #1 - Response code:"+resp1);
		
		
	}
	
	
	private static int testIntercepting(String httpsURL) {
		
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
		

		URL myurl = new URL(httpsURL);
		HttpsURLConnection con = (HttpsURLConnection)myurl.openConnection();
		con.setRequestMethod("GET");
		
		return con.getResponseCode();
		
		}catch(Exception e) {
			e.printStackTrace();
			return -1;
		}
	}
	
	

}
