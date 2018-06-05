package it.exception.registration;

import it.exception.ServletException;
import it.utility.network.HTTPCodesClass;

public class TelephoneAlreadyExistsException extends ServletException {

	/**
	 * 
	 */
	private static final long serialVersionUID = -2511814843991349899L;

	
	
	private Integer httpCode = HTTPCodesClass.CONFLICT;
	private String message = "Telephone already taken";
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
