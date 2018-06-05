package it.entity;

import java.sql.Timestamp;

public class FailedLoginsIP {
	public FailedLoginsIP(String ip, Integer attempts, Timestamp starting) {
		super();
		this.setIp(ip);
		this.setAttempts(attempts);
		this.setStarting(starting);
	}
	public Timestamp getStarting() {
		return starting;
	}
	public void setStarting(Timestamp starting) {
		this.starting = starting;
	}
	public Integer getAttempts() {
		return attempts;
	}
	public void setAttempts(Integer attempts) {
		this.attempts = attempts;
	}
	public String getIp() {
		return ip;
	}
	public void setIp(String ip) {
		this.ip = ip;
	}
	private String ip;
	private Integer attempts;
	private Timestamp starting;
	
	

}
