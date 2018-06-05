package it.debug.registration;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.net.URL;
import java.net.URLEncoder;
import java.util.LinkedHashMap;
import java.util.Map;

import javax.net.ssl.HttpsURLConnection;

public class DebugRegistrationServlet {
	public static void main(String[] args) throws IOException {
		boolean result;
		result = registrationAttempt("Luca", "Pirozzi");
	//System.out.println(result);
//	result = registrationAttempt("username", "password");
		//System.out.println(result);
	}
public static boolean registrationAttempt(String username, String password) throws IOException {
	HttpsURLConnection.setDefaultHostnameVerifier ((hostname, session) -> true);
	 URL url = new URL("https://localhost:8443/CertificateServer/register");
     Map<String,Object> params = new LinkedHashMap<>();
    params.put("username",username);
    params.put("password", password);

     StringBuilder postData = new StringBuilder();
     for (Map.Entry<String,Object> param : params.entrySet()) {
         if (postData.length() != 0) postData.append('&');
         postData.append(URLEncoder.encode(param.getKey(), "UTF-8"));
         postData.append('=');
         postData.append(URLEncoder.encode(String.valueOf(param.getValue()), "UTF-8"));
     }
     byte[] postDataBytes = postData.toString().getBytes("UTF-8");

     HttpsURLConnection conn = (HttpsURLConnection)url.openConnection();
     conn.setRequestMethod("POST");
     conn.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");
     conn.setRequestProperty("Content-Length", String.valueOf(postDataBytes.length));
     conn.setDoOutput(true);
     conn.getOutputStream().write(postDataBytes);
     
     if(conn.getResponseCode()==200)
     {
    	 
     

     Reader in = new BufferedReader(new InputStreamReader(conn.getInputStream(), "UTF-8"));

     for (int c; (c = in.read()) >= 0;)
         System.out.print((char)c);
     return true;
     }
     else
    	 return false;
     
     
 
}

}
