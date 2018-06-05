package it.dao;

import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.Vector;

import it.entity.TrustedDevice;
import it.utility.MutableBoolean;
import it.utility.database.DatabaseTriple;
import it.utility.database.DatabaseUtility;



public class DAOTrustedIPs {
	public static final Integer CODE_DURATION = 30;
	private static final Integer MINUTES_TO_MILLISECONDS = 60*1000;
	private static DatabaseUtility db = DatabaseUtility.getInstance();
	public static Vector<TrustedDevice> vector = getAll();
	
	
	public static Vector<TrustedDevice> getAll ()
	{ Vector<TrustedDevice> vector = new Vector<TrustedDevice>();
		try {
		String query = "SELECT * FROM TRUSTED_DEVICES";
		DatabaseTriple triple = new DatabaseTriple(db.connect());
		triple.setPreparedStatement(triple.getConn().prepareStatement(query));
		triple.setResultSet(triple.getPreparedStatement().executeQuery());
		while(triple.getResultSet().next())
		{
			vector.add(new TrustedDevice(triple.getResultSet().getString(1), triple.getResultSet().getString(2)));
		}
		
		triple.closeAll();
		}
		catch (SQLException e)
		{
			e.printStackTrace();
		}
		return vector;
	}
	
	
	public static boolean isTrusted (String username, String ip) throws SQLException
	{
		System.out.println("IP in input:"+ip);
		
		for (int i=0; i<vector.size(); i++)
		{
			System.out.println("ip da checkare:"+vector.get(i).getIp());
			
			if(vector.get(i).getIp().equals(ip) && vector.get(i).getUsername().equals(username))
			{
				return true;
			}
		}
		return false;
	}
	
	public static String retrieveCode(String username,String ip) throws SQLException
	{
		String code = null;
		String query = "SELECT VALUE FROM MAIL_CODES WHERE USERNAME=? AND IP=?";
		DatabaseTriple triple = new DatabaseTriple(db.connect());
		triple.setPreparedStatement(triple.getConn().prepareStatement(query));
		triple.getPreparedStatement().setString(1, username);
		triple.getPreparedStatement().setString(2, ip);
		triple.setResultSet(triple.getPreparedStatement().executeQuery());
		if(triple.getResultSet().next())
		{
			code = triple.getResultSet().getString(1);
		}
		
		triple.closeAll();
		return code;
	}
	
	public static boolean validCodeExists (String username, String ip, MutableBoolean onceSent) throws SQLException
	{
		Boolean validCode = false;
		Timestamp codeTimestamp;
		onceSent.setFlag(false);
		String query = "SELECT * FROM MAIL_CODES WHERE USERNAME=? AND IP = ?";
		DatabaseTriple triple = new DatabaseTriple(db.connect());
		triple.setPreparedStatement(triple.getConn().prepareStatement(query));
		triple.getPreparedStatement().setString(1, username);
		triple.getPreparedStatement().setString(2, ip);
		triple.setResultSet(triple.getPreparedStatement().executeQuery());
		if(triple.getResultSet().next())
		{
			onceSent.setFlag(true);
			codeTimestamp = triple.getResultSet().getTimestamp(3);
			if(System.currentTimeMillis() < codeTimestamp.getTime() + CODE_DURATION * MINUTES_TO_MILLISECONDS)
			{
				validCode = true;
			}
		}
		triple.closeAll();
		return validCode;
	}
	public static boolean validCodeExists (String username, String ip) throws SQLException
	{
		MutableBoolean ignoreParameter = new MutableBoolean(false);
		return validCodeExists(username, ip,ignoreParameter);
	}
	
	public static void updateCode(String username, String ip, String code) throws SQLException
	{
		String query = "UPDATE  MAIL_CODES SET ISSUED=?, VALUE=sha2(?,256) WHERE USERNAME=? AND IP = ?";
		DatabaseTriple triple = new DatabaseTriple(db.connect());
		triple.setPreparedStatement(triple.getConn().prepareStatement(query));
		triple.getPreparedStatement().setTimestamp(1, new Timestamp(System.currentTimeMillis()));
		triple.getPreparedStatement().setString(2, code);
		triple.getPreparedStatement().setString(3, username);
		triple.getPreparedStatement().setString(4, ip);
		triple.getPreparedStatement().executeUpdate();
		triple.closeAll();
	}
	
	public static void deleteCode (String username, String ip) throws SQLException
	{
		String query = "DELETE FROM MAIL_CODES WHERE USERNAME=? AND IP=?";
		DatabaseTriple triple = new DatabaseTriple(db.connect());
		triple.setPreparedStatement(triple.getConn().prepareStatement(query));
		triple.getPreparedStatement().setString(1, username);
		triple.getPreparedStatement().setString(2, ip);
		triple.getPreparedStatement().executeUpdate();
		triple.closeAll();
	}
	public static void insertCode(String username, String ip, String code) throws SQLException
	{
		String query = "INSERT INTO MAIL_CODES VALUES (?,?,?,sha2(?,256))";
		DatabaseTriple triple = new DatabaseTriple(db.connect());
		triple.setPreparedStatement(triple.getConn().prepareStatement(query));
		triple.getPreparedStatement().setString(1, username);
		triple.getPreparedStatement().setString(2, ip);
		triple.getPreparedStatement().setTimestamp(3, new Timestamp(System.currentTimeMillis()));
		triple.getPreparedStatement().setString(4, code);
		triple.getPreparedStatement().executeUpdate();
		triple.closeAll();
	}
	
	public static void insertTrustedDevice (String username, String ip) throws SQLException
	{
		String query = "INSERT IGNORE INTO TRUSTED_DEVICES VALUES (?,?)";
		DatabaseTriple triple = new DatabaseTriple(db.connect());
		triple.setPreparedStatement(triple.getConn().prepareStatement(query));
		triple.getPreparedStatement().setString(1, username);
		triple.getPreparedStatement().setString(2, ip);
		triple.getPreparedStatement().executeUpdate();
		triple.closeAll();
		vector.add(new TrustedDevice(username, ip));
	}
	
}


