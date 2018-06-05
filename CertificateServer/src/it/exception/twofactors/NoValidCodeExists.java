package it.exception.twofactors;

import it.exception.ServletException;

public class NoValidCodeExists extends ServletException {

	/**
	 * 
	 */
	private static final long serialVersionUID = -1625213366952406678L;
	private Integer httpCode = 404;
	private String message = "No valid code found";
	
	
	public NoValidCodeExists() {
		// TODO Auto-generated constructor stub
	}
		
	

	public Integer getHttpCode() {
		return httpCode;
	}

	public void setHttpCode(Integer httpCode) {
		this.httpCode = httpCode;
	}

	public String getMessage() {
		return message;
	}

	public void setMessage(String message) {
		this.message = message;
	}

}
