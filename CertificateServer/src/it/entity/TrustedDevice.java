package it.entity;

public class TrustedDevice {
	public TrustedDevice(String username, String ip) {
		super();
		this.username = username;
		this.ip = ip;
	}
	private String username;
	private String ip;
	public String getUsername() {
		return username;
	}
	public void setUsername(String username) {
		this.username = username;
	}
	public String getIp() {
		return ip;
	}
	public void setIp(String ip) {
		this.ip = ip;
	}
	
	
}
