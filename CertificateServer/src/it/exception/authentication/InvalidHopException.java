package it.exception.authentication;

import it.exception.ServletException;

public class InvalidHopException extends ServletException {
	private Integer httpCode = 400;
	private String message = "HopCount invalid";

	/**
	 * 
	 */
	private static final long serialVersionUID = 8835563580192642242L;
	/**
	 * 
	 */

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
