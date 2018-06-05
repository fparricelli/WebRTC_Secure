package it.authorization;

import java.io.IOException;
import java.util.HashMap;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONException;
import org.json.JSONObject;

import it.authentication.AuthenticationLogic;
import it.exception.authentication.InvalidHopException;
import it.exception.authorization.MissingTokenException;
import it.utility.network.HTTPCodesClass;
import it.utility.network.HTTPCommonMethods;

/**
 * Servlet Filter implementation class HTMLFilter
 */

public class HTMLFilter implements Filter {

    /**
     * Default constructor. 
     */
    public HTMLFilter() {
        // TODO Auto-generated constructor stub
    }

	/**
	 * @see Filter#destroy()
	 */
	public void destroy() {
		// TODO Auto-generated method stub
	}

	/**
	 * @see Filter#doFilter(ServletRequest, ServletResponse, FilterChain)
	 */
	public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
		
		String token = ((HttpServletRequest)request).getParameter("param");
		System.out.println("[HTML FILTER] TOKEN:"+token);
		
		try {
		
		
		if(token != null) {
			
			HashMap<String, Object> params = new HashMap<String, Object>();
			boolean validateResult = AuthenticationLogic.isValidToken(token, params);
			
			if(validateResult) {
				System.out.println("[HTML FILTER] TOKEN OK!!");
				
				chain.doFilter(request, response);

			}else{
				System.out.println("[HTML FILTER] TOKEN NOT OK!!");
				throw new InvalidHopException();
				
			}
			
		}else {
			System.out.println("[HTML FILTER] NULL!!");
			throw new MissingTokenException();
			
		}
		
		}catch(InvalidHopException | MissingTokenException e) {
			
			((HttpServletResponse)response).sendRedirect("./denied.html");
			e.printStackTrace();
			return;
			
		}
		
		
		
		
		
		
		
	}

	/**
	 * @see Filter#init(FilterConfig)
	 */
	public void init(FilterConfig fConfig) throws ServletException {
		// TODO Auto-generated method stub
	}

}
