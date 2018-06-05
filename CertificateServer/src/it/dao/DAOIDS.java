package it.dao;

import java.sql.SQLException;
import java.sql.Timestamp;

import org.apache.log4j.LogManager;
import org.apache.log4j.Logger;

import it.utility.MutableBoolean;
import it.utility.MutableInteger;
import it.utility.database.DatabaseTriple;
import it.utility.database.DatabaseUtility;

public class DAOIDS {
	private static DatabaseUtility db = DatabaseUtility.getInstance();
	private static final Integer LOCKOUT_DURATION = 20;
	private static final Integer MILLISECONDS_TO_MINUTES = 60 * 1000;
	private static final Integer FAILED_ATTEMPTS_DURATION = 15;
	private static final Integer MAXIMUM_FAILED_LOGINS = 4;
	private static final Integer IP_LOCKOUT = 2;
	private static final Integer LOCKOUT_CHECK_DAYS = 1;
	private static final Integer MILLISECONDS_TO_HOURS = 60 * MILLISECONDS_TO_MINUTES;
	
	//Numero massimo di account che possono essere bloccati prima di ricevere un BAN IP TEMPORANEO.
	private static final Integer MAXIMUM_ACCOUNTS_ATTEMPTS_FOR_IP = 4;
	private static final Integer SECONDS_TO_MINUTES = 60;
	private static final Integer MINUTES_TO_HOURS = 60;
	private static final Integer HOURS_TO_DAYS = 24;
	private static final Integer SECONDS_LOCKOUT_CHECK = LOCKOUT_CHECK_DAYS * HOURS_TO_DAYS * MINUTES_TO_HOURS * SECONDS_TO_MINUTES;

 public static Logger log = LogManager.getRootLogger();
	
	public static boolean isLockedOut(String username, String ip) throws SQLException {
		boolean locked = false;
		Timestamp startinglockout;
		long timestamp;
		String query = "SELECT * FROM ACCOUNT_LOCKDOWN WHERE LOCKDOWN_USERNAME = ? AND IP = ?";
		DatabaseTriple triple = new DatabaseTriple(db.connect());
		triple.setPreparedStatement(triple.getConn().prepareStatement(query));
		triple.getPreparedStatement().setString(1, username);
		triple.getPreparedStatement().setString(2, ip);
		triple.setResultSet(triple.getPreparedStatement().executeQuery());
		if (triple.getResultSet().next()) {
			startinglockout = triple.getResultSet().getTimestamp(3);
			timestamp = startinglockout.getTime();
			if (System.currentTimeMillis() > timestamp + LOCKOUT_DURATION * MILLISECONDS_TO_MINUTES) {
				deleteLockout(username, ip);
			} else {
				locked = true;
			}

		}
		triple.closeAll();
		
		return locked;
	}

	public static void deleteLockout(String username, String ip) throws SQLException {
		String query = "DELETE FROM ACCOUNT_LOCKDOWN WHERE LOCKDOWN_USERNAME = ? AND IP = ?";
		DatabaseTriple triple = new DatabaseTriple(db.connect());
		triple.setPreparedStatement(triple.getConn().prepareStatement(query));
		triple.getPreparedStatement().setString(1, username);
		triple.getPreparedStatement().setString(2, ip);
		triple.getPreparedStatement().executeUpdate();
		triple.closeAll();

	}

	public static void insertLockout(String username, String ip) throws SQLException {
		System.out.println("Inserisco un lockout (username,ip) a (" + username + "," + ip + ")");
		String query = "INSERT IGNORE INTO ACCOUNT_LOCKDOWN VALUES (?,?,?)";
		DatabaseTriple triple = new DatabaseTriple(db.connect());
		triple.setPreparedStatement(triple.getConn().prepareStatement(query));
		triple.getPreparedStatement().setString(1, username);
		triple.getPreparedStatement().setString(2, ip);
		triple.getPreparedStatement().setTimestamp(3, new Timestamp(System.currentTimeMillis()));
		triple.getPreparedStatement().executeUpdate();
		triple.closeAll();
		
	}

	public static void handleFailedLogin(String username, String ip, MutableBoolean needsUpdate, MutableBoolean locktimeout, MutableInteger attempts) throws SQLException {
		String query = "SELECT * FROM FAILED_LOGINS WHERE USERNAME_FAILED = ? AND IP = ?";
		DatabaseTriple triple = new DatabaseTriple(db.connect());
		Integer failedAttempts = 0;
		Timestamp loginTimestamp;
		triple.setPreparedStatement(triple.getConn().prepareStatement(query));
		triple.getPreparedStatement().setString(1, username);
		triple.getPreparedStatement().setString(2, ip);
		triple.setResultSet(triple.getPreparedStatement().executeQuery());
		
		if (triple.getResultSet().next()) {
			loginTimestamp = triple.getResultSet().getTimestamp(4);
			if (System.currentTimeMillis() > loginTimestamp.getTime()
					+ FAILED_ATTEMPTS_DURATION * MILLISECONDS_TO_MINUTES) {
				updateFailedLogin(username, ip);
			} else {
				failedAttempts = triple.getResultSet().getInt(3);
				if (failedAttempts < MAXIMUM_FAILED_LOGINS) {
					System.out.println("Ho aggiornato i login falliti a " + (failedAttempts+1));
					updateFailedLogin(username, ip, failedAttempts + 1);
				} else {
					System.out.println("Ho raggiunto il limite massimo di login falliti");
					updateFailedLogin(username, ip, MAXIMUM_FAILED_LOGINS+1);
					insertLockout(username, ip);
					log.warn("["+ip+"] - TOO MANY ATTEMPTS FOR: "+username);
					handleLockedUserPerIp(ip, needsUpdate, locktimeout, attempts);
				}
			}

		}

		else {
			insertNewFailedLogin(username, ip);
		}

		triple.closeAll();

	}

	public static void deleteFailedLogin(String username, String ip) throws SQLException {
		String query = "DELETE FROM FAILED_LOGINS WHERE USERNAME_FAILED =? AND IP =?";
		DatabaseTriple triple = new DatabaseTriple(db.connect());
		triple.setPreparedStatement(triple.getConn().prepareStatement(query));
		triple.getPreparedStatement().setString(1, username);
		triple.getPreparedStatement().setString(2, ip);
		triple.getPreparedStatement().executeUpdate();
		triple.closeAll();
	}

	public static void insertNewFailedLogin(String username, String ip) throws SQLException {
		String query = "INSERT INTO FAILED_LOGINS VALUES (?,?,?,?)";
		DatabaseTriple triple = new DatabaseTriple(db.connect());
		triple.setPreparedStatement(triple.getConn().prepareStatement(query));
		triple.getPreparedStatement().setString(1, username);
		triple.getPreparedStatement().setString(2, ip);
		triple.getPreparedStatement().setInt(3, 1);
		triple.getPreparedStatement().setTimestamp(4, new Timestamp(System.currentTimeMillis()));
		triple.getPreparedStatement().executeUpdate();
		triple.closeAll();
	}

	public static void updateFailedLogin(String username, String ip, Integer attempts, Timestamp timestamp)
			throws SQLException {
		String query = "UPDATE FAILED_LOGINS SET ATTEMPTS = ?,  FIRST_ATTEMPT = ? WHERE USERNAME_FAILED = ? AND IP = ?";
		DatabaseTriple triple = new DatabaseTriple(db.connect());
		triple.setPreparedStatement(triple.getConn().prepareStatement(query));
		triple.getPreparedStatement().setInt(1, attempts);
		triple.getPreparedStatement().setTimestamp(2, new Timestamp(System.currentTimeMillis()));
		triple.getPreparedStatement().setString(3, username);
		triple.getPreparedStatement().setString(4, ip);
		triple.getPreparedStatement().executeUpdate();
		triple.closeAll();
	}

	public static void updateFailedLogin(String username, String ip, Integer attempts) throws SQLException {
		String query = "UPDATE FAILED_LOGINS SET ATTEMPTS = ? WHERE USERNAME_FAILED = ? AND IP = ?";
		DatabaseTriple triple = new DatabaseTriple(db.connect());
		triple.setPreparedStatement(triple.getConn().prepareStatement(query));
		triple.getPreparedStatement().setInt(1, attempts);
		triple.getPreparedStatement().setString(2, username);
		triple.getPreparedStatement().setString(3, ip);
		triple.getPreparedStatement().executeUpdate();
		triple.closeAll();
	}

	public static void updateFailedLogin(String username, String ip) throws SQLException {
		String query = "UPDATE FAILED_LOGINS SET ATTEMPTS = ?, FIRST_ATTEMPT = ? WHERE USERNAME_FAILED = ? AND IP = ?;";
		DatabaseTriple triple = new DatabaseTriple(db.connect());
		triple.setPreparedStatement(triple.getConn().prepareStatement(query));
		triple.getPreparedStatement().setInt(1, 1);
		triple.getPreparedStatement().setTimestamp(2, new Timestamp(System.currentTimeMillis()));
		triple.getPreparedStatement().setString(3, username);
		triple.getPreparedStatement().setString(4, ip);
		triple.getPreparedStatement().executeUpdate();
		triple.closeAll();
	}

	public static boolean isIPLocked(String ip, MutableBoolean needsUpdate, MutableBoolean lockTimeout,
			MutableInteger failed_account_attempts) throws SQLException {
		failed_account_attempts.setInteger(0);
		failed_account_attempts.setInteger(handleCountLockedUser(ip));
		boolean locked = false;
		needsUpdate.setFlag(false);
		Timestamp lockingTime;
		String query = "SELECT * FROM LOCKDOWN_IPS WHERE IP = ? ORDER BY LOCKDOWN_IPS.STARTING DESC LIMIT 1";
		DatabaseTriple triple = new DatabaseTriple(db.connect());
		triple.setPreparedStatement(triple.getConn().prepareStatement(query));
		triple.getPreparedStatement().setString(1, ip);
		triple.setResultSet(triple.getPreparedStatement().executeQuery());
		if (triple.getResultSet().next()) {
			if(triple.getResultSet().getInt(2)<MAXIMUM_ACCOUNTS_ATTEMPTS_FOR_IP && triple.getResultSet().getTimestamp(3).getTime()<System.currentTimeMillis() + IP_LOCKOUT *24 * 3600 * 1000)
			{
		needsUpdate.setFlag(true);
			}
			lockingTime = triple.getResultSet().getTimestamp(3);
			if(lockingTime.getTime()+ IP_LOCKOUT * MILLISECONDS_TO_HOURS> System.currentTimeMillis())
			{
				lockTimeout.setFlag(true);
			}
			if (lockingTime.getTime() + IP_LOCKOUT * MILLISECONDS_TO_HOURS > System.currentTimeMillis()) {
				if (failed_account_attempts.getInteger() >= MAXIMUM_ACCOUNTS_ATTEMPTS_FOR_IP) {
					checkMaximumCountAccountLocksForLockedIP(ip, lockingTime);
					locked = true;
				}
			} else {
				lockTimeout.setFlag(true);
			}

		}
		triple.closeAll();
		return locked;
	}

	public static void handleLockedUserPerIp(String ip, MutableBoolean needsUpdate, MutableBoolean locktimeout, MutableInteger attempts) throws SQLException {
		
		
		
		if (!needsUpdate.isFlag()) {
				insertLockedUsersPerIP(ip);
			}

			else {
				if(attempts.getInteger() > MAXIMUM_ACCOUNTS_ATTEMPTS_FOR_IP)
				{
					attempts.setInteger(MAXIMUM_ACCOUNTS_ATTEMPTS_FOR_IP-1);
				}
				System.out.println("Ho aggiornato gli account bloccati a " + (attempts.getInteger()+1));
				updateLockedUsersPerIP(ip, attempts.getInteger()+1);
				if(attempts.getInteger() + 1 >= MAXIMUM_ACCOUNTS_ATTEMPTS_FOR_IP)
				{
					
					log.error(("["+ip+"] TEMPORARILY BANNED"));
				}
			}
		

	}

	public static void insertLockedUsersPerIP(String ip) throws SQLException {
		String query = "INSERT INTO LOCKDOWN_IPS VALUES (?,?,?)";
		DatabaseTriple triple = new DatabaseTriple(db.connect());
		triple.setPreparedStatement(triple.getConn().prepareStatement(query));
		triple.getPreparedStatement().setString(1, ip);
		triple.getPreparedStatement().setInt(2, 1);
		triple.getPreparedStatement().setTimestamp(3, new Timestamp(System.currentTimeMillis()));
		triple.getPreparedStatement().executeUpdate();
		triple.closeAll();
	}

	public static void updateLockedUsersPerIP(String ip) throws SQLException {
		String query = "UPDATE LOCKDOWN_IPS SET LOCKDOWN_IPS.FAILED = ?, LOCKDOWN_IPS.STARTING = ? WHERE LOCKDOWN_IPS.IP = ?";
		DatabaseTriple triple = new DatabaseTriple(db.connect());
		triple.setPreparedStatement(triple.getConn().prepareStatement(query));
		triple.getPreparedStatement().setInt(1, 1);
		triple.getPreparedStatement().setTimestamp(2, new Timestamp(System.currentTimeMillis()));
		triple.getPreparedStatement().setString(3, ip);
		triple.getPreparedStatement().executeUpdate();
		triple.closeAll();
	}

	public static void updateLockedUsersPerIP(String ip, Integer attempts) throws SQLException {
		String query = "UPDATE LOCKDOWN_IPS SET FAILED = ? WHERE IP = ? ORDER BY LOCKDOwN_IPS.STARTING DESC LIMIT 1";
		DatabaseTriple triple = new DatabaseTriple(db.connect());
		triple.setPreparedStatement(triple.getConn().prepareStatement(query));
		triple.getPreparedStatement().setInt(1, attempts);
		triple.getPreparedStatement().setString(2, ip);
		triple.getPreparedStatement().executeUpdate();
		triple.closeAll();
	}
	

	public static void updateLockedUsersPerIP(String ip, Integer attempts, Timestamp time) throws SQLException {
		String query = "UPDATE LOCKDOWN_IPS SET FAILED = ? WHERE IP = ? AND LOCKDOWN_IPS.STARTING =?";
		DatabaseTriple triple = new DatabaseTriple(db.connect());
		triple.setPreparedStatement(triple.getConn().prepareStatement(query));
		triple.getPreparedStatement().setInt(1, attempts);
		triple.getPreparedStatement().setString(2, ip);
		triple.getPreparedStatement().setTimestamp(3, time);
		triple.getPreparedStatement().executeUpdate();
		triple.closeAll();
	}
	
	
	
	
	public static Integer countLockedUser(String ip, Timestamp lastLocked) throws SQLException
	{
		boolean oneDay = true;
		Integer count;
		if(lastLocked!=null)
		{
			if(lastLocked.getTime() > System.currentTimeMillis() - 24*60*60*1000)
			{
				oneDay = false;
			}
		}
		if(oneDay)
		{
			return countLockedUsers(ip);
		}

		DatabaseTriple triple = new DatabaseTriple(db.connect());
		String query = "SELECT COUNT(*) from ACCOUNT_LOCKDOWN WHERE ACCOUNT_LOCKDOWN.STARTING >? AND IP=?";
		triple.setPreparedStatement(triple.getConn().prepareStatement(query));
		triple.getPreparedStatement().setTimestamp(1, lastLocked);
		triple.getPreparedStatement().setString(2, ip);
		triple.setResultSet(triple.getPreparedStatement().executeQuery());
		triple.getResultSet().next();
		count = triple.getResultSet().getInt(1);
		triple.closeAll();
		return count;
		
	}
	
	public static Integer handleCountLockedUser(String ip) throws SQLException
	{
		Timestamp time = lastIPLocked(ip);
		if(time!=null)
		{
			if(System.currentTimeMillis() < time.getTime() + IP_LOCKOUT * MILLISECONDS_TO_HOURS)
		{
			if(countLockedUsersInterval(ip, time)>=MAXIMUM_ACCOUNTS_ATTEMPTS_FOR_IP)
			{
			return MAXIMUM_ACCOUNTS_ATTEMPTS_FOR_IP;
			}
		}
		}
		Integer count = countLockedUser(ip, time);
		return count;
	}
	
	public static Integer countLockedUsersInterval (String ip, Timestamp time) throws SQLException
	{
		Integer count = 0;
		String query =	"SELECT FAILED from LOCKDOWN_IPS WHERE LOCKDOWN_IPS.STARTING=? AND LOCKDOWN_IPS.IP=?";
		DatabaseTriple triple = new DatabaseTriple(db.connect());
		triple.setPreparedStatement(triple.getConn().prepareStatement(query));
		triple.getPreparedStatement().setTimestamp(1, time);
		triple.getPreparedStatement().setString(2, ip);
		triple.setResultSet(triple.getPreparedStatement().executeQuery());
		triple.getResultSet().next();
		count = triple.getResultSet().getInt(1);
		triple.closeAll();
		return count;
	}
	public static Integer countLockedUsers (String ip) throws SQLException
	{ 
		
	Integer count = 0;
	String query =	"SELECT COUNT(*) from ACCOUNT_LOCKDOWN WHERE ACCOUNT_LOCKDOWN.STARTING > CURRENT_TIMESTAMP-? AND IP=?";
	DatabaseTriple triple = new DatabaseTriple(db.connect());
	triple.setPreparedStatement(triple.getConn().prepareStatement(query));
	triple.getPreparedStatement().setInt(1, SECONDS_LOCKOUT_CHECK);
	triple.getPreparedStatement().setString(2, ip);
	triple.setResultSet(triple.getPreparedStatement().executeQuery());
	if(triple.getResultSet().next())
		
	{
		count = triple.getResultSet().getInt(1);
	}
	triple.closeAll();
	return count;
	}
	
	public static Timestamp lastIPLocked(String ip) throws SQLException
	{
		Timestamp time = null;
		String query =	"select LOCKDOWN_IPS.starting from LOCKDOWN_IPS WHERE IP = ? ORDER BY LOCKDOWN_IPS.starting DESC LIMIT 1";
		DatabaseTriple triple = new DatabaseTriple(db.connect());
		triple.setPreparedStatement(triple.getConn().prepareStatement(query));
		triple.getPreparedStatement().setString(1, ip);
		triple.setResultSet(triple.getPreparedStatement().executeQuery());
		if(triple.getResultSet().next())
		{
			time = triple.getResultSet().getTimestamp(1);
		}
		
		return time;
		
	}
	
	public static void checkMaximumCountAccountLocksForLockedIP (String ip, Timestamp time) throws SQLException
	{
		String query =	"select LOCKDOWN_IPS.FAILED from LOCKDOWN_IPS WHERE IP = ? AND LOCKDOWN_IPS.STARTING = ?";
		DatabaseTriple triple = new DatabaseTriple(db.connect());
		Integer attempts = null;
		triple.setPreparedStatement(triple.getConn().prepareStatement(query));
		triple.getPreparedStatement().setString(1, ip);
		triple.getPreparedStatement().setTimestamp(2, time);
		triple.setResultSet(triple.getPreparedStatement().executeQuery());
		if(triple.getResultSet().next())
		{
			attempts=triple.getResultSet().getInt(1);
		}
		triple.closeAll();
		if(attempts.equals(MAXIMUM_ACCOUNTS_ATTEMPTS_FOR_IP))
		{
			updateLockedUsersPerIP(ip, MAXIMUM_ACCOUNTS_ATTEMPTS_FOR_IP + 1, time);
		}
	}


}
