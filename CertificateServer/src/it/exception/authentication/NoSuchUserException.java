package it.exception.authentication;

import it.exception.ServletException;

public class NoSuchUserException extends ServletException {
	private Integer httpCode = 401;
	private String message = "Nonexistent User";

	/**
	 * 
	 */
	private static final long serialVersionUID = -7789639950103793679L;

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
