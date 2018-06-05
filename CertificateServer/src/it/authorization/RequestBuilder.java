package it.authorization;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.HashSet;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang.StringUtils;

import com.sun.xacml.attr.StringAttribute;
import com.sun.xacml.ctx.Attribute;
import com.sun.xacml.ctx.RequestCtx;
import com.sun.xacml.ctx.Subject;


public class RequestBuilder
{

  static final String ACTION_IDENTIFIER = "urn:oasis:names:tc:xacml:1.0:action:action-id";
  static final String SUBJECT_IDENTIFIER = "urn:oasis:names:tc:xacml:1.0:subject:subject-id";
  static final String RESOURCE_IDENTIFIER = "urn:oasis:names:tc:xacml:1.0:resource:resource-id";
  static final String SUBJECT_ROLE_IDENTIFIER = "ruolo";    
   
    
    @SuppressWarnings({ "rawtypes", "unchecked" })
	public static Set setupSubjects(HttpServletRequest request) throws URISyntaxException {
        HashSet attributes = new HashSet();
        HashSet subjects = new HashSet();
          
		String ruolo = (String)((HttpServletRequest)request).getSession().getAttribute("ruolo");
		System.out.println("[RequestBuilder] Ruolo:"+ruolo);
		
       //Questo è l'attributo del soggetto a cui fare riferimento nella policy xml, attraverso il suo identificatore
        
        attributes.add(new Attribute(new URI(SUBJECT_ROLE_IDENTIFIER),
                null, null,
                new StringAttribute(ruolo)));
                
        subjects.add(new Subject(attributes));
       
        return subjects;
    }

    
    /**
     * Creates a Resource specifying the resource-id, a required attribute.
     *
     * @return a Set of Attributes for inclusion in a Request
     *
     * @throws URISyntaxException if there is a problem with a URI
     */
    @SuppressWarnings({ "rawtypes", "unchecked" })
	public static Set setupResource(HttpServletRequest request) throws URISyntaxException {
        
    	HashSet resource = new HashSet();
       

        // the resource being requested : è una URI ma passata come stringa
        
        
        
        
        String res = "https://localhost:8443"+request.getRequestURI();
        String subres = StringUtils.chop(res);
        String subres2 = StringUtils.chop(subres);
       
        
        String lista = (String)((HttpServletRequest)request).getSession().getAttribute("lista");
        
        String resID = subres2+lista+"/";
        
        
        StringAttribute resAtt = new StringAttribute(resID);
        
        
        resource.add(new Attribute(new URI(RESOURCE_IDENTIFIER),
                                   null, null, resAtt));
         
        return resource;
    }

    /**
     * Creates an Action specifying the action-id, an optional attribute.
     *
     * @return a Set of Attributes for inclusion in a Request
     *
     * @throws URISyntaxException if there is a problem with a URI
     */
    @SuppressWarnings({ "rawtypes", "unchecked" })
	public static Set setupAction() throws URISyntaxException {
        HashSet action = new HashSet();

        // this is a standard URI that can optionally be used to specify
        // the action being requested
        URI actionId =
            new URI(ACTION_IDENTIFIER);

        // create the action
        action.add(new Attribute(actionId, null, null,
                                 new StringAttribute("view")));

        return action;
    }

    
    @SuppressWarnings("rawtypes")
	public static RequestCtx createXACMLRequest(HttpServletRequest request) throws Exception{
        
      RequestCtx XACMLrequest = new RequestCtx(setupSubjects(request), setupResource(request),setupAction(), new HashSet());
      
      return XACMLrequest;
    }
    



}

