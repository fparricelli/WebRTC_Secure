package it.exception.registration;

import it.exception.ServletException;
import it.utility.network.HTTPCodesClass;

public class MailAlreadyExistsException extends ServletException {
	private Integer httpCode = HTTPCodesClass.CONFLICT;
	private String message = "Mail already taken";
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
