package it.debug;

import java.io.DataOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.URL;

import javax.net.ssl.HostnameVerifier;
import javax.net.ssl.HttpsURLConnection;

public class DebugCertificateServlet {
	
	public static void main(String[] args) {
		
		//Testo usando una coppia nome,cognome di un certificato presente
		int resp = testCertificate("Aldo", "Strofaldi");
		//Mi aspetto response code = 200
		System.out.println("Test #1 - Response code = "+resp);
		//Mi aspetto di trovare il File scaricato
		File f = new File("./Certificato.cer");
		System.out.println("Test #1 - File esistente:"+f.exists()+", Nome: "+f.getName());
		//Lo cancello per i successivi test
		f.delete();
		
		//Testo usando una coppia nome, cognome di un certificato non presente
		int resp2 = testCertificate("nomeacaso","cognomeacaso");
		//Mi aspetto response code = 404
		System.out.println("Test #2 - Response code = "+resp2);
		
		
	}
	
	
	private static int testCertificate(String nome, String cognome) {
		
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
		
		String httpsURL = "https://localhost:8443/CertificateServer/getCertificate";

		URL myurl = new URL(httpsURL);
		HttpsURLConnection con = (HttpsURLConnection)myurl.openConnection();
		con.setRequestMethod("POST");
		
		String query = "nome="+nome+"&cognome="+cognome;

		con.setDoOutput(true); 
		con.setDoInput(true);
		
		DataOutputStream output = new DataOutputStream(con.getOutputStream());  

		output.writeBytes(query);
		output.flush();
		output.close();

		int respCode =  con.getResponseCode();
		
		if(respCode == 200) {
		
		File f = new File("./Certificato.cer");
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
		    return respCode;
		    
		}else {
			return respCode;
		}
		
		}catch(Exception e) {
			e.printStackTrace();
			return -1;
		}
	}

}
