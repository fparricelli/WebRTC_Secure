package it.authorization;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileReader;
import java.io.IOException;
import java.io.OutputStream;
import java.io.PrintWriter;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Set;


import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.LogManager;
import org.apache.log4j.Logger;
import org.json.JSONObject;
import org.json.XML;
import org.owasp.esapi.errors.AccessControlException;
import org.owasp.esapi.reference.IntegerAccessReferenceMap;

import com.sun.xacml.PDP;
import com.sun.xacml.PDPConfig;
import com.sun.xacml.ctx.RequestCtx;
import com.sun.xacml.ctx.ResponseCtx;
import com.sun.xacml.ctx.Result;
import com.sun.xacml.finder.AttributeFinder;
import com.sun.xacml.finder.PolicyFinder;
import com.sun.xacml.finder.impl.CurrentEnvModule;
import com.sun.xacml.finder.impl.FilePolicyModule;

import it.authentication.AuthenticationLogic;
import it.exception.authentication.InvalidHopException;
import it.exception.authorization.InvalidRoleException;
import it.utility.network.HTTPCodesClass;
import it.utility.network.HTTPCommonMethods;




public class ContactListFilter implements Filter {

	private IntegerAccessReferenceMap listMap;
	private IntegerAccessReferenceMap roleMap;
	private IntegerAccessReferenceMap optionMap;
	private final static int OPTION = 12;
	private static Logger log;
	
	
	
	
   
    public ContactListFilter() {
    	
    }

	
	public void destroy() {
		
	}

	
	@SuppressWarnings({ "unchecked", "rawtypes" })
	public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
		
		String lista1 = ((HttpServletRequest)request).getParameter("list");
		String ruolo1 = ((HttpServletRequest)request).getParameter("ruolo");
		String token = ((HttpServletRequest)request).getParameter("token");
		System.out.println("[ContactListFilter - Debug] Ricevo ruolo="+ruolo1+", lista="+lista1+", token="+token);
		
		
		String regen = ((HttpServletRequest)request).getParameter("option");
		
		
		String list,ruolo = "";
		String newToken = null;
		String username = "";
		boolean validateResult = false;
	
		try {
		
		
		if(regen != null) {
			
			System.out.println("[ContactListFilter - Debug] Ottenuto valore option:"+regen);
			Integer option = optionMap.getDirectReference(regen);
			
			if(option == OPTION) {
				System.out.println("[ContactListFilter - Debug] Rinnovo token");
				newToken = AuthenticationLogic.regenToken(token);
				System.out.println("[ContactListFilter - Debug] new Token :"+newToken);
			}
			
		}else {
			System.out.println("[ContactListFilter - Debug] Richiedo solo validazione");
			HashMap<String, Object> params = new HashMap<String, Object>();
			validateResult = AuthenticationLogic.isValidToken(token, params);
			
			username = params.get("username").toString();
			System.out.println("[ContactListFilter - Debug] Trovato:"+username);
			
			
		}
		
			
		if((regen!=null && newToken == null) || ((regen==null) && !validateResult)) {

			System.out.println("[ContactListFilter - Debug] Token non valido!");
			throw new InvalidHopException();
		
		}else{
			
			RoleManager rm = RoleManager.getInstance();
			
			System.out.println("[ContactListFilter - Debug] Token valido!");
			
			String listp = ((HttpServletRequest)request).getParameter("list");
			String ruolop = ((HttpServletRequest)request).getParameter("ruolo");
			
			System.out.println("[ContactListFilter - Debug] Ricevuto list:"+listp);
			System.out.println("[ContactListFilter - Debug] Ricevuto ruolo:"+ruolop);
			
			
			if(username != null && rm.hasUsername(username)) {
				
				String savedRoleN = rm.getRole(username);
				System.out.println("[ContactListFilter - Debug] Trovato ruolo salvato:"+savedRoleN);
				if(!(savedRoleN).equals(ruolop)) {
					throw new InvalidRoleException(ruolop, savedRoleN);
				}
				
			}
			
			
			String listIntm = listMap.getDirectReference(listp);
			String ruoloIntm = roleMap.getDirectReference(ruolop);
			
			
			
			
			list = convertList(listIntm);
			ruolo = convertRole(ruoloIntm);
			
			((HttpServletRequest)request).getSession().setAttribute("lista", list);
			((HttpServletRequest)request).getSession().setAttribute("ruolo", ruolo);
			
			System.out.println("[ContactListFilter - Debug] Mapped lista:"+list);
			System.out.println("[ContactListFilter - Debug] Mapped ruolo:"+ruolo);
			
		
			File f;
			String policyfile;
			FilePolicyModule policyModule = new FilePolicyModule();
			PolicyFinder policyFinder = new PolicyFinder();
			Set policyModules = new HashSet();
        
			String PATH_POLICY = ((HttpServletRequest)request).getServletContext().getRealPath("/policy");
			File [] listaFile = (new File(PATH_POLICY)).listFiles();
        
			for(int i=0;i<listaFile.length;i++)
			{
             
				f=listaFile[i];
				policyfile = f.getAbsolutePath();
				policyModule.addPolicy(policyfile); 
				policyModules.add(policyModule);
				policyFinder.setModules(policyModules);
			}

			CurrentEnvModule envModule = new CurrentEnvModule();
			AttributeFinder attrFinder = new AttributeFinder();
			List attrModules = new ArrayList();
			attrModules.add(envModule);
			attrFinder.setModules(attrModules);
		
			RequestCtx XACMLrequest = RequestBuilder.createXACMLRequest((HttpServletRequest)request);
  	  
    	
			PDP pdp = new PDP(new PDPConfig(attrFinder, policyFinder, null));

			ResponseCtx XACMLresponse = pdp.evaluate(XACMLrequest);
        
			Set ris_set = XACMLresponse.getResults();
			Result ris = null;
			Iterator it = ris_set.iterator();

			while (it.hasNext()) {
				ris = (Result) it.next();
			}
        
			int dec = ris.getDecision();

			if (dec == 0) {
				System.out.println("PERMIT");
				if(newToken != null) {
					((HttpServletResponse)response).addHeader("newtoken", newToken);
				}
				((HttpServletRequest)request).getSession().invalidate();
				chain.doFilter(request, response);
				
			} else if (dec == 1) {
				System.out.println("DENY");
				HTTPCommonMethods.sendReplyHeaderWithToken(((HttpServletResponse)response), HTTPCodesClass.UNAUTHORIZED,newToken);
				((HttpServletRequest)request).getSession().invalidate();
				
				String timeStamp = new SimpleDateFormat("yyyy.MM.dd.HH.mm.ss").format(new Date());
				//log.warn("["+timeStamp+"] - Request from "+request.getRemoteAddr()+" - access denied for requested list="+list+"");
				
				
			} else if (dec == 2||dec==3) {
        	
				System.out.println("NOT APPLICABLE");
				HTTPCommonMethods.sendReplyHeaderWithToken(((HttpServletResponse)response), HTTPCodesClass.UNAUTHORIZED,newToken);
				((HttpServletRequest)request).getSession().invalidate();
				
				String timeStamp = new SimpleDateFormat("yyyy.MM.dd.HH.mm.ss").format(new Date());
				//log.warn("["+timeStamp+"] - Request from "+request.getRemoteAddr()+" - unapplicable policy for requested list="+list+" and role="+ruolo);
				
			}
		}
    
	
    }catch(InvalidHopException e) {
        	
        System.err.println(e.getMessage());
        
        
        HTTPCommonMethods.sendReplyHeaderOnly(((HttpServletResponse)response), HTTPCodesClass.TEMPORARY_REDIRECT);
        ((HttpServletRequest)request).getSession().invalidate();
        
        String timeStamp = new SimpleDateFormat("yyyy.MM.dd.HH.mm.ss").format(new Date());
        
		//log.error("["+timeStamp+"] - Request from "+request.getRemoteAddr()+" token expired (invalid hop) for supplied token");
	
		
    }catch(InvalidRoleException er) {
    	
    	System.err.println(er.getMessage());
		
    	HTTPCommonMethods.sendReplyHeaderWithToken(((HttpServletResponse)response), HTTPCodesClass.UNAUTHORIZED, newToken);
    	((HttpServletRequest)request).getSession().invalidate();
    	
    	String timeStamp = new SimpleDateFormat("yyyy.MM.dd.HH.mm.ss").format(new Date());
        
		//log.error("["+timeStamp+"] - Request from "+request.getRemoteAddr()+": role different from the stored one");
	
        
    }catch(IOException ex) {
        ex.printStackTrace();
        //In caso di IOException, non posso mandare risposta su output stream
        
       String timeStamp = new SimpleDateFormat("yyyy.MM.dd.HH.mm.ss").format(new Date());
       //Se inviamo lo stack trace come log, è necessario fare le opportune considerazioni di sicurezza riguardo
       //..tale scelta.
       //log.error("["+timeStamp+"] - Request from "+request.getRemoteAddr()+" IOException occured");
        
        ((HttpServletRequest)request).getSession().invalidate();
        
    }catch(AccessControlException ac) {
    	ac.printStackTrace();
    	
    	HTTPCommonMethods.sendReplyHeaderWithToken(((HttpServletResponse)response), HTTPCodesClass.UNAUTHORIZED, newToken);
	    ((HttpServletRequest)request).getSession().invalidate();
    	
    	String listp = ((HttpServletRequest)request).getParameter("list");
		String ruolop = ((HttpServletRequest)request).getParameter("ruolo");
		
		String timeStamp = new SimpleDateFormat("yyyy.MM.dd.HH.mm.ss").format(new Date());
        //log.error("["+timeStamp+"] - Request from "+request.getRemoteAddr()+" no parameter mapping for supplied role:"+listp+"and list:"+ruolop);
        
        
    }catch(Exception exx) {
	   exx.printStackTrace();
	   //lato client, rimando al login
	   HTTPCommonMethods.sendReplyHeaderOnly(((HttpServletResponse)response), HTTPCodesClass.SERVER_ERROR);
       ((HttpServletRequest)request).getSession().invalidate();
	   
	   String timeStamp = new SimpleDateFormat("yyyy.MM.dd.HH.mm.ss").format(new Date());

	   //log.error("["+timeStamp+"] - Request from "+request.getRemoteAddr()+" Exception:"+exx.getMessage()+" occured");
      
       
       
   }
        
		
	}

	
	@SuppressWarnings({ "rawtypes", "unchecked" })
	public void init(FilterConfig fConfig) throws ServletException {
		Set listSet = new HashSet();
		listSet.add("listTecnici");
		listSet.add("listAdmins");
		listSet.add("listUtenti");
		listMap = new IntegerAccessReferenceMap(listSet);
		
	
		
		Set roleSet = new HashSet();
		roleSet.add("roleTecnico");
		roleSet.add("roleAdmin");
		roleSet.add("roleUtente");
		roleMap = new IntegerAccessReferenceMap(roleSet);
		
		Set dummySet = new HashSet();
		dummySet.add(OPTION);
		optionMap = new IntegerAccessReferenceMap(dummySet);
		
		log = LogManager.getRootLogger();
			
	}
	
	
	
	
	private String convertList(String list) {
		if(list.equals("listAdmins")) {
			return "admins";
		}else if(list.equals("listUtenti")) {
			return "utenti";
		}else {
			return "tecnici";
		}
	}

	private String convertRole(String role) {
		if(role.equals("roleAdmin")) {
			return "admin";
		}else if(role.equals("roleUtente")) {
			return "utente";
		}else {
			return "tecnico";
		}
	}
	
	
	
	
	 

}
