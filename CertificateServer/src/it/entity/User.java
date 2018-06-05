package it.entity;

public class User {
	public User(String username, String name, String surname, String email, String role,
			Integer telephone) {
		super();
		this.username = username;
		this.name = name;
		this.surname = surname;
		this.email = email;
		this.role = role;
		this.telephone = telephone;
	}
	private String username;
	private String name;
	private String surname;
	private String email;
	private String role;
	private Integer telephone;
	public String getUsername() {
		return username;
	}
	public void setUsername(String username) {
		this.username = username;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public String getSurname() {
		return surname;
	}
	public void setSurname(String surname) {
		this.surname = surname;
	}
	public String getEmail() {
		return email;
	}
	public void setEmail(String email) {
		this.email = email;
	}
	public String getRole() {
		return role;
	}
	public void setRole(String role) {
		this.role = role;
	}
	public Integer getTelephone() {
		return telephone;
	}
	public void setTelephone(Integer telephone) {
		this.telephone = telephone;
	}

}
