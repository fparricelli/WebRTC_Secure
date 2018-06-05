package it.accessControl;

import java.sql.SQLException;

import it.dao.DAOIDS;
import it.utility.MutableBoolean;
import it.utility.MutableInteger;

public class IDS {
	
	public static boolean isIPLocked (String ip, MutableBoolean needsUpdate, MutableBoolean lockTimeout, MutableInteger failed_account_attempts) throws SQLException
	{
		return DAOIDS.isIPLocked(ip, needsUpdate, lockTimeout, failed_account_attempts);
	}
	public static boolean isLockedOut (String username,String ip) throws SQLException
	{
		return DAOIDS.isLockedOut(username, ip);
	}

	
}
