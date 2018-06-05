package it.certificates;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.security.cert.CertificateException;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.bouncycastle.asn1.x500.RDN;
import org.bouncycastle.asn1.x500.X500Name;
import org.bouncycastle.asn1.x500.style.BCStyle;
import org.bouncycastle.asn1.x500.style.IETFUtils;
import org.bouncycastle.cert.jcajce.JcaX509CertificateHolder;

import it.exception.certificates.CertificateNotFoundException;
import it.utility.network.HTTPCodesClass;
import it.utility.network.HTTPCommonMethods;


public class CertificateServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private ServletConfig config;   
   
    public CertificateServlet() {
        super();
        
    }

    public void init(ServletConfig config) throws ServletException {
		this.config = config;
	}
    
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException{  
    
    	
    	String nome = ((HttpServletRequest)request).getParameter("nome").toLowerCase();
		String cognome = ((HttpServletRequest)request).getParameter("cognome").toLowerCase();
		
		try {
			
			
			System.out.println("[CertificateServlet] Token Valido!");
			File cer = findCertificate(nome,cognome);
			
			response.setContentType("application/octet-stream");
			response.setContentLength((int) cer.length());
			response.setHeader( "Content-Disposition",
			         String.format("attachment; filename=\"%s\"", cer.getName()));
			
			OutputStream outs = response.getOutputStream();
			
			FileInputStream in = new FileInputStream(cer);
			byte[] buffer = new byte[4096];
			int length;
			while ((length = in.read(buffer)) > 0) {
			   outs.write(buffer, 0, length);
			}
			
			in.close();
			outs.flush();
			outs.close();
			
			
		}catch(CertificateNotFoundException c) {
			
			System.out.println(c.getMessage());
			HTTPCommonMethods.sendReplyHeaderOnly(((HttpServletResponse)response), HTTPCodesClass.NOT_FOUND);
			
		}catch(IOException ce) {
			ce.printStackTrace();
		}catch(Exception e) {
			e.printStackTrace();
			HTTPCommonMethods.sendReplyHeaderOnly(((HttpServletResponse)response), HTTPCodesClass.NOT_FOUND);
		}
		
    
    
    }
   
    
    private File findCertificate(String nome, String cognome) throws CertificateNotFoundException,IOException, CertificateException {
    	
    	File cer = null;
    
    	String certPath = config.getServletContext().getRealPath("/certificates");
    	CertificateFactory fact = CertificateFactory.getInstance("X.509");
    	File certDir = new File(certPath);
    	
    	if(!certDir.exists()) {
    			
    		certDir.mkdir();
    	}
    	
    		
    	File [] certs = certDir.listFiles();
    		
    	FileInputStream fis = null;
    		
    	for(int i = 0;i<certs.length;i++) {
    		
    		fis = new FileInputStream(certs[i]);
    		X509Certificate cert = (X509Certificate) fact.generateCertificate(fis);
    		X500Name x500name = new JcaX509CertificateHolder(cert).getSubject();
    		RDN cn = x500name.getRDNs(BCStyle.CN)[0];

    		String identity = IETFUtils.valueToString(cn.getFirst().getValue()).toLowerCase();
    			
    		String inputIdentity = nome+" "+cognome;
    			
    		if(identity.equals(inputIdentity)) {
    			fis.close();
    			cer = certs[i];
    			break;
    		}else {
    			fis.close();
    		}
    			
    		}
    	
    	if(cer!= null) {
    		return cer;
    	}else {
    		throw new CertificateNotFoundException();
    	}
    		
  
    	
    }
    
    
    
    

}
