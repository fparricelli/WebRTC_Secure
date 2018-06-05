package it.exception;

import it.utility.network.HTTPCodesClass;

public class BadRequestException extends ServletException {

	/**
	 * 
	 */
	private static final long serialVersionUID = 4619457033928490760L;


	
	
	private Integer httpCode = HTTPCodesClass.BAD_REQUEST;
	private String message = "Request is bad formed";
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
