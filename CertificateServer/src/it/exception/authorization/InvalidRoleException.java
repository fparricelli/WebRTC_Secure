package it.exception.authorization;

public class InvalidRoleException extends Exception{
	
	private Integer httpCode = 401;
	private String message = "Supplied role is different from the one stored in ";
	private static final long serialVersionUID = 1L;
	private String r_provided;
	private String r_stored;
	
	public InvalidRoleException(String provided, String stored) {
		this.r_provided = provided;
		this.r_stored = stored;
		this.message = "Supplied role: "+r_provided+" is different from the stored one: "+r_stored;
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
