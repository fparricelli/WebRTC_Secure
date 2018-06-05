package it.entity;

import java.sql.Timestamp;

public class LockedUserIP {

	public LockedUserIP(String username, String ip, Integer attempts, Timestamp firstAttempt) {
		super();
		this.username = username;
		this.ip = ip;
		this.attempts = attempts;
		this.firstAttempt = firstAttempt;
	}
	private String username;
	private String ip;
	private Integer attempts;
	private Timestamp firstAttempt;
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
	public Integer getAttempts() {
		return attempts;
	}
	public void setAttempts(Integer attempts) {
		this.attempts = attempts;
	}
	public Timestamp getFirstAttempt() {
		return firstAttempt;
	}
	public void setFirstAttempt(Timestamp firstAttempt) {
		this.firstAttempt = firstAttempt;
	}
	
	
}
