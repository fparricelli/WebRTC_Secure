package it.exception.authentication;

import it.exception.ServletException;
import it.utility.network.HTTPCodesClass;

public class LockedIP extends ServletException  {
	private Integer httpCode = HTTPCodesClass.FORBIDDEN;
	private String message = "IP Locked";
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
