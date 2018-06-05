package it.debug.authentication;

public class DebugThread implements Runnable{

	@Override
	public void run() {
		try {
			DebugAuthenticationServlet.createIPLockdownFromFailedLoginsTime();
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
	}
	

}
