package it.exception.certificates;

public class CertificateNotFoundException extends Exception{

	private Integer httpCode = 404;
	private String message = "Certificate not found!";
	private static final long serialVersionUID = 1L;
	
	public CertificateNotFoundException() {
		
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
