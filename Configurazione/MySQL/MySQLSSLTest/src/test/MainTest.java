package test;

import java.sql.Connection;
import java.sql.DriverManager;

public class MainTest {
	
	public static void main (String[] args)
	{
		Connection con = null;
		try
		{
			//Modificare con path e password del trust-store della JVM.
			System.setProperty("javax.net.ssl.trustStore","C:\\Program Files\\Java\\jre1.8.0_131\\lib\\security\\cacerts");
			System.setProperty("javax.net.ssl.trustStorePassword","changeit");
			
			
			String url = "jdbc:mysql://localhost:3306/videostore_schema"+
				"?verifyServerCertificate=true"+
				"&useSSL=true"+
				"&requireSSL=true";
			String user = "ssluser";
			String password = "sslpassword";
				
			Class dbDriver = Class.forName("com.mysql.jdbc.Driver");
			con = DriverManager.getConnection(url, user, password);
			System.out.println("Connected!");
		}
		catch (Exception ex)
		{
			ex.printStackTrace();
		}
		finally
		{
			if (con != null)
			{
				try
				{
					con.close();
				}
				catch (Exception e){}
			}
		}
	}
	
	
	
	

}
