package it.utility.database;

import java.sql.*;

public class DatabaseTriple {
	public DatabaseTriple(Connection conn, PreparedStatement statement, ResultSet resultSet) {
		super();
		setConn(conn);
		setPreparedStatement(statement);
		setResultSet(resultSet);
	}

	public DatabaseTriple(Connection conn) {
		super();
		setConn(conn);
		setPreparedStatement(null);
		setResultSet(null);
	}

	private Connection conn;
	private PreparedStatement statement;
	private ResultSet resultSet;

	public void closeAll() {
		try {
			if (resultSet != null) {
				getResultSet().close();
			}
			if (statement != null) {
				statement.close();
			}

			if (conn != null) {
				conn.close();
			}

		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

	}

	public Connection getConn() {
		return conn;
	}

	public void setConn(Connection conn) {
		this.conn = conn;
	}

	public PreparedStatement getPreparedStatement() {
		return statement;
	}

	public void setPreparedStatement(PreparedStatement statement) {
		this.statement = statement;
	}

	public ResultSet getResultSet() {
		return resultSet;
	}

	public void setResultSet(ResultSet resultSet) {
		this.resultSet = resultSet;
	}

}
