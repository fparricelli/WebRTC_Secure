package it.webfilters;


import java.io.IOException;

import java.util.ArrayList;
import java.util.List;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.annotation.WebFilter;

import javax.servlet.http.HttpServletResponse;


@WebFilter("/*")
public class CSPPoliciesApplier implements Filter {



	/** Filter configuration */
	@SuppressWarnings("unused")
	private FilterConfig filterConfig = null;

	/** List CSP HTTP Headers */
	private List<String> cspHeaders = new ArrayList<String>();

	/** Collection of CSP policies that will be applied */
	private String policies = null;

	
	/**
	 * Used to prepare (one time for all) set of CSP policies that will be applied on each HTTP response.
	 * 
	 * @see javax.servlet.Filter#init(javax.servlet.FilterConfig)
	 */
	@Override
	public void init(FilterConfig fConfig) throws ServletException {
		// Get filter configuration
		this.filterConfig = fConfig;


		// Define list of CSP HTTP Headers
		this.cspHeaders.add("Content-Security-Policy");
		this.cspHeaders.add("X-Content-Security-Policy");
		this.cspHeaders.add("X-WebKit-CSP");

		// Define CSP policies
		// Loading policies for Frame and Sandboxing will be dynamically defined : We need to know if context use Frame
		List<String> cspPolicies = new ArrayList<String>();
		String originLocationRef = "'self'";
		String none = "'none'";
		String googleApis = "https://ajax.googleapis.com";
		String websocketApi = "wss://localhost:12345";
		String themesApi = "https://cdnjs.cloudflare.com/ajax/libs/jquery-confirm/";
		String redirectApi = "https://cdn.rawgit.com/";
		// --Disable default source in order to avoid browser fallback loading using 'default-src' locations
		cspPolicies.add("default-src "+originLocationRef);
		// --Define loading policies for Scripts
		cspPolicies.add("script-src " +originLocationRef+" "+googleApis+" "+themesApi+" "+redirectApi);		
		// --Define loading policies for Connection
		cspPolicies.add("connect-src " +originLocationRef+" "+websocketApi);
		cspPolicies.add("style-src *");
		cspPolicies.add("font-src *");
		cspPolicies.add("object-src "+none);
		

		// Target formating
		this.policies = cspPolicies.toString().replaceAll("(\\[|\\])", "").replaceAll(",", ";").trim();
	}

	/**
	 * Add CSP policies on each HTTP response.
	 * 
	 * @see javax.servlet.Filter#doFilter(javax.servlet.ServletRequest, javax.servlet.ServletResponse, javax.servlet.FilterChain)
	 */
	@Override
	public void doFilter(ServletRequest request, ServletResponse response, FilterChain fchain) throws IOException, ServletException {
		
		HttpServletResponse httpResponse = ((HttpServletResponse) response);

		

		/* Add CSP policies to HTTP response */
		StringBuilder policiesBuffer = new StringBuilder(this.policies);


		// Add policies to all HTTP headers
		for (String header : this.cspHeaders) {
			httpResponse.setHeader(header, policiesBuffer.toString());
		}

		/* Let request continue chain filter */
		fchain.doFilter(request, response);
	}

	/**
	 * {@inheritDoc}
	 * 
	 * @see javax.servlet.Filter#destroy()
	 */
	@Override
	public void destroy() {
		// Not used
	}
}