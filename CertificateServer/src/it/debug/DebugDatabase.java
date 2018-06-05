package it.debug;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;

import it.dao.DAOIDS;
import it.utility.database.DatabaseTriple;
import it.utility.database.DatabaseUtility;

public class DebugDatabase {
	public static final String local = "127.0.0.1";

	public static void main(String[] args) throws SQLException {
		//debugResult();
		//debugSHA();
		checkDBFunctions(local);
	}

	public static void checkDBFunctions (String ip) throws SQLException
	{
		DAOIDS.handleCountLockedUser(ip);
	}
	public static void debugSHA() throws SQLException 
	{
		DatabaseUtility db = DatabaseUtility.getInstance();
		String username = "Luca";
		String ip ="127.0.0.1";
		String randomCode = "notSoRandom . . .";
		String query = "INSERT INTO MAIL_CODES VALUES (?,?,?,sha2(?,256))";
		DatabaseTriple triple = new DatabaseTriple(db.connect());
		triple.setPreparedStatement(triple.getConn().prepareStatement(query));
		triple.getPreparedStatement().setString(1, username);
		triple.getPreparedStatement().setString(2, ip);
		triple.getPreparedStatement().setTimestamp(3, new Timestamp(System.currentTimeMillis()));
		triple.getPreparedStatement().setString(4, "randomCode");
		triple.getPreparedStatement().executeUpdate();
		triple.closeAll();
	}

	public static void debugResult() throws SQLException {
		for (int i = 0; i < 100; i++) {

			DatabaseTriple triple = DatabaseUtility.getInstance().query("SELECT * FROM USERS");
			try {
				ResultSet result = triple.getResultSet();
				result.next();
				System.out.println(result.getString(1));
				triple.closeAll();
			} catch (SQLException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}

		}
	}

	public static void debugConnection() {
		for (int i = 0; i < 100; i++) {
			Connection conn = DatabaseUtility.getInstance().connect();
			System.out.println(conn);
			try {
				conn.close();
			} catch (SQLException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
	}
}
