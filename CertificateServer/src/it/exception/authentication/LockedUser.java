package it.exception.authentication;

import it.exception.ServletException;

public class LockedUser extends ServletException {
	private Integer httpCode = 403;
	private String message = "Account is locked out";
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
