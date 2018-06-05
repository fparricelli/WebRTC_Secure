package it.debug.authentication;

import java.util.Vector;

public class DebugThreadCorrectLogin implements Runnable{
	private static final Integer attempts = 20;
	private Vector<Double> times = new Vector<Double>();
	private Double average = new Double(0);

	@Override
	public void run() {
		long starting,ending,interval;
		String username = "username";
		String password = "password";
		for (int i=0; i<attempts; i++) {
		starting = System.nanoTime();
		try {
			DebugAuthenticationServlet.testServlet(username, password);
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		ending = System.nanoTime();
		interval = ending - starting;
		times.add((double)interval/1000000);
		}
		for (int i=0; i<times.size(); i++)
		{
			average += times.get(i);
		}
		average = average/times.size();
		System.out.println("Tempo medio: " + average);
	}
}
