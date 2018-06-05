package it.dao;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Vector;

import it.entity.User;
import it.exception.authentication.NoSuchUserException;
import it.utility.database.DatabaseTriple;
import it.utility.database.DatabaseUtility;

public class DAOUsers {

	private static DatabaseUtility db = DatabaseUtility.getInstance();
	public static Vector<User> utenti = getAll();

	public static Vector<User> getAll() {
		Vector<User> vettore = new Vector<User>();

		try {
			ResultSet res;
			String query = "SELECT * FROM USERS";
			DatabaseTriple triple = new DatabaseTriple(db.connect());
			triple.setPreparedStatement(triple.getConn().prepareStatement(query));
			triple.setResultSet(triple.getPreparedStatement().executeQuery());
			triple.setPreparedStatement(triple.getConn().prepareStatement(query));
			while (triple.getResultSet().next()) {
				res = triple.getResultSet();
				String username = res.getString(1);
				String name = res.getString(3);
				String surname = res.getString(4);
				String email = res.getString(5);
				Integer telephone = res.getInt(6);
				String role = res.getString(7);
				vettore.add(new User(username, name, surname, email, role, telephone));
			}
			triple.closeAll();
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return vettore;
	}

	
	public static boolean telephoneAlreadyTaken (Integer telephone)
	{
		for(int i=0; i<utenti.size(); i++)
		{
			if(utenti.get(i).getTelephone().equals(telephone))
			{
				return true;
			}
		}
		return false;
	}
	
	public static boolean mailAlreadyTaken(String mail)
	{
		for(int i=0; i<utenti.size(); i++)
		{if(utenti.get(i).getEmail()!=null)
		{
			if(utenti.get(i).getEmail().equals(mail))
			{
				return true;
			}
		}
		}
		
		return false;
	}
	public static boolean usernameAlreadyTaken(String u) throws SQLException {
	if(getUser(u)!=null)
	{
		return true;
	}
	
	return false;
	}

	public static void store(String username,String hash,String mail,String name, String surname,Integer telephone) throws SQLException {
		String query1 = "INSERT INTO USERS ";
		String query2 = " VALUES ";
		String query3 = "(?,?,?,?,?,?,?);";
		String query = query1 + query2 + query3;
		String role = "utente";
		DatabaseTriple triple = new DatabaseTriple(db.connect());

		triple.setPreparedStatement(triple.getConn().prepareStatement(query));
		triple.getPreparedStatement().setString(1, username);
		triple.getPreparedStatement().setString(2, hash);
		triple.getPreparedStatement().setString(3, name);
		triple.getPreparedStatement().setString(4, surname);
		triple.getPreparedStatement().setString(5, mail);
		triple.getPreparedStatement().setInt(6, telephone);
		triple.getPreparedStatement().setString(7, role);
		triple.getPreparedStatement().executeUpdate();
		triple.closeAll();
		utenti.add(new User(username, name, surname, mail, role, telephone));

	}

	public static String load_hash(String username) throws NoSuchUserException, SQLException {
	    {
	        String hash = null;
	        String query1= "SELECT PASSWORD FROM USERS ";
	        String query2= "WHERE USERNAME=? LIMIT  1";
	        String query = query1+query2;
	        DatabaseTriple triple = new DatabaseTriple(db.connect());
	        try {
	        triple.setPreparedStatement(triple.getConn().prepareStatement(query));    
	        triple.getPreparedStatement().setString(1, username);
	        triple.setResultSet(triple.getPreparedStatement().executeQuery());
	        if(triple.getResultSet().next())
	        {
	            hash =triple.getResultSet().getString(1);
	            
	        }
	        else
	        {
	        	throw new NoSuchUserException();
	        }
	        }
	        
	        catch (SQLException e)
	        {
	        e.printStackTrace();    
	        }
	        triple.closeAll();
	    
	                
	        return hash;
	    }
	

			
			
	}

	public static User getUser(String username) {
		for (int i = 0; i < utenti.size(); i++) {
			if (utenti.get(i).getUsername().equals(username)) {
				return utenti.get(i);
			}
		}

		return null;
	}

	public static String getUserMail(String username) throws SQLException {
		System.out.println("MAIL: " + getUser(username).getEmail());
		return getUser(username).getEmail();
		}

	public static HashMap<String, String> getUserDetails(String username) throws SQLException {
		HashMap<String, String> map = new HashMap<String, String>();
	User u = getUser(username);;
		map.put("name",u.getName());
		map.put("surname",u.getSurname());
		map.put("telephone",u.getTelephone().toString());
		map.put("role",u.getRole());;
		return map;
	}
}
