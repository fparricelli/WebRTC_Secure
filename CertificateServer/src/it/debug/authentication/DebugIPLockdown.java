package it.debug.authentication;

import java.sql.SQLException;

import it.dao.DAOIDS;
import it.utility.MutableBoolean;
import it.utility.MutableInteger;

public class DebugIPLockdown {
	public static void main(String[] args) throws SQLException {
//	System.out.println(test1("127.0.0.1"));	
	//System.out.println(test2("127.0.0.1"));
	//System.out.println("TEST 3 : " + test3());
	System.out.println("TEST 4: " + causeIPLock());
	}
	
	public static Boolean causeIPLock() throws SQLException
	{	String ip = "127.0.0.1";
	MutableBoolean needsUpdate = new MutableBoolean(false);
	MutableBoolean lockTimeout = new MutableBoolean(false);
	MutableInteger failed_account_attempts = new MutableInteger();
		for (int i=0; i<5; i++)
		{
			DAOIDS.isIPLocked(ip, needsUpdate, lockTimeout, failed_account_attempts);
			DAOIDS.handleLockedUserPerIp(ip, needsUpdate , lockTimeout, failed_account_attempts);
		}
	return DAOIDS.isIPLocked(ip, needsUpdate, lockTimeout, failed_account_attempts);
	}
	
	public static Boolean test1(String ip) throws SQLException
	{
		return DAOIDS.isIPLocked(ip, new MutableBoolean(true), new MutableBoolean(true), new MutableInteger());
	}
	
	public static Boolean test2(String ip) throws SQLException 
	{
		MutableBoolean needsUpdate = new MutableBoolean(false);
		MutableBoolean lockTimeout = new MutableBoolean(false);
		MutableInteger failed_account_attempts = new MutableInteger();
		Boolean isLocked = DAOIDS.isIPLocked(ip, needsUpdate, lockTimeout, failed_account_attempts);
		System.out.println("NEEDS UPDATE " + needsUpdate.isFlag());
		System.out.println("HAS LOCKDOWN EXPIRED " +lockTimeout.isFlag());
		System.out.println("FAILED_ATTEMPTS " +failed_account_attempts);
		return isLocked;
	}
	
	public static Boolean test3() throws SQLException
	{
		String ip = "127.0.0.1";
		MutableBoolean needsUpdate = new MutableBoolean(false);
		MutableBoolean lockTimeout = new MutableBoolean(false);
		MutableInteger failed_account_attempts = new MutableInteger();
		Boolean isLocked = DAOIDS.isIPLocked(ip, needsUpdate, lockTimeout, failed_account_attempts);
		System.out.println("NEEDS UPDATE " + needsUpdate.isFlag());
		System.out.println("HAS LOCKDOWN EXPIRED " +lockTimeout.isFlag());
		System.out.println("FAILED_ATTEMPTS " +failed_account_attempts);
		DAOIDS.handleLockedUserPerIp(ip, needsUpdate, lockTimeout, failed_account_attempts);
		return isLocked;
	}
}
