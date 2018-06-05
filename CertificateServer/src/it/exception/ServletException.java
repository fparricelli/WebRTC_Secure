package it.exception;

public class ServletException extends Exception {
	private Integer httpCode;
	private String message;

	public ServletException ()
	{
		this.setHttpCode(0);
		this.setMessage("No message set");
	}
	
	public ServletException (Integer httpcode, String message)
	{
		this.setHttpCode(httpCode);
		this.setMessage(message);
	}
	/**
	 * 
	 */
	private static final long serialVersionUID = 8099243334181077396L;

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
	public static long getSerialversionuid() {
		return serialVersionUID;
	}

}
