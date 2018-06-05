package it.authentication.twosteps;

import java.sql.SQLException;

import org.apache.commons.codec.digest.DigestUtils;

import it.dao.DAOTrustedIPs;
import it.exception.twofactors.NoValidCodeExists;

public class TwoStepsLogic {
	public static final Integer CODE_DURATION = DAOTrustedIPs.CODE_DURATION;

	public static boolean validCodeExists (String username, String ip) throws SQLException
	{
		return DAOTrustedIPs.validCodeExists(username, ip);
	}
	
	public static String retrieveCode (String username, String ip) throws SQLException
	{
		return DAOTrustedIPs.retrieveCode(username, ip);
	}
	
	public static boolean isCodeRight (String username, String ip, String providedCode) throws SQLException
	{
		boolean result = false;
		String hashedProvided = DigestUtils.sha256Hex(providedCode);
		String storedCode = retrieveCode(username, ip);
		result = hashedProvided.equals(storedCode);
		return result;
	}
	
	public static boolean handleCode (String username, String ip, String providedCode) throws SQLException, NoValidCodeExists
	{boolean isRight = false;
	System.out.println("DEBUG - HANDLE CODE : " + username + " "+  ip + " " + providedCode);
		if(validCodeExists(username, ip))
		{
			isRight = isCodeRight(username, ip, providedCode);
			if(isRight)
			{
				addTrustedDevice(username, ip);
				deleteCode(username,ip);
			}
		}
		
		else
		{
			throw new NoValidCodeExists();
		}
		
		return isRight;
	}
	
	public static void deleteCode (String username, String ip) throws SQLException
	{
		DAOTrustedIPs.deleteCode(username, ip);
	}
	
	public static void addTrustedDevice (String username,String ip) throws SQLException
	{
		DAOTrustedIPs.insertTrustedDevice(username, ip);
	}
	
	
	
}
