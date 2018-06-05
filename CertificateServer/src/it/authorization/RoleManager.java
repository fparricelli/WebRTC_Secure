package it.authorization;

import java.util.HashMap;

public class RoleManager {
	
	private volatile static RoleManager instance = null;
	private HashMap<String,String> rolesMapping;
	
	public static RoleManager getInstance() {
		if (instance == null) {
			
			synchronized(RoleManager.class) {
				
				if(instance == null) {
					instance = new RoleManager();
				}
			
			}
		}

	return instance;

	}
	
	
	
	
	private RoleManager() {
		this.rolesMapping = new HashMap<String,String>();
	}
	
	public synchronized String getRole(String key) {
		System.out.println("[RoleManager - Debug] Prendo con chiave:"+key+" il valore "+this.rolesMapping.get(key));

		return this.rolesMapping.get(key);
		
	}
	
	
	public synchronized void setRole(String key, String value) {
		System.out.println("[RoleManager - Debug] Inserisco:"+key+", e "+value);
		this.rolesMapping.put(key, value);
	}
	
	
	public synchronized boolean hasUsername(String u) {
		return this.rolesMapping.containsKey(u);
	}
	
	
	
	
	
	
	

}
