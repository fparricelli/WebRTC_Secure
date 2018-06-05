package it.exception.authorization;

public class MissingTokenException extends Exception{
	
	private Integer httpCode = 401;
	private static final long serialVersionUID = 1L;
	private String message = "Missing token!";
	
	public MissingTokenException() {
	
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
