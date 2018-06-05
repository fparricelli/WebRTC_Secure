package it.debug.twofactors;

import java.io.IOException;
import java.net.URL;
import java.net.URLEncoder;
import java.util.LinkedHashMap;
import java.util.Map;

import javax.net.ssl.HttpsURLConnection;

public class DebugServlet {
	public static void main(String[] args) throws IOException {
		testServlet("Luca", "ZAYnvkbZe8");
	}
	public static void testServlet (String username, String code) throws IOException
	{
	HttpsURLConnection.setDefaultHostnameVerifier((hostname, session) -> true);
	URL url = new URL("https://localhost:8443/CertificateServer/twofactors");
	Map<String, Object> params = new LinkedHashMap<>();
	params.put("username", username);
	params.put("code", code);
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
	}
}
