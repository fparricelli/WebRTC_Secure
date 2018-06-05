package it.debug;

import org.apache.log4j.Logger;

import java.io.IOException;

import org.apache.log4j.LogManager;

public class DebugLogging {
	
	private static Logger log = LogManager.getRootLogger();
	
	
	public static void main(String[] args) {
		
		log.debug("Messaggio di debug");

	    // Wait here for user input, as logger needs a moment
	    // to spawn its daemon thread and begin sending
	    try{
	      System.in.read();
	    }catch(IOException e){
	      //Do nothing
	    }
		
		
	}

}
