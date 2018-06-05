package it.websocket.comm;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.UUID;
import java.util.concurrent.Semaphore;

import javax.servlet.ServletConfig;

public class UpdaterThread extends Thread{
	
	private String path;
	private ServletConfig config;
	private Semaphore sem;
	
	public UpdaterThread(ServletConfig config, String p, Semaphore s) {
		this.config = config;	
		this.sem = s;
		this.path = this.config.getServletContext().getRealPath(p);
	};
	
	public void run(){
		
	while(true) {
		
		try {
			
			Thread.sleep(1800000);
			
			sem.acquire();
			
			String uuid = UUID.randomUUID().toString().replace("-", "");
			
			System.out.println("[UpdaterThread] Writing:"+uuid);
			
			FileWriter fw; fw = new FileWriter(path);
			fw.write(uuid);
			fw.close();
			
			sem.release();
			
			
			
		} catch (IOException e) {
			
			System.err.println("[UpdaterThread] Impossibile scrivere sul file secure_key.txt!");
			e.printStackTrace();
					
		}catch(InterruptedException e) {
			e.printStackTrace();
		}catch(Exception e) {
			e.printStackTrace();
		}
		
	}
		
		
	}
	
	

}
