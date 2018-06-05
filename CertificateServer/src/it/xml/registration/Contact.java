package it.xml.registration;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;

@XmlRootElement(namespace = "it.sm.ContactList")
@XmlType(propOrder = { "username", "name", "surname", "telephone" })
public class Contact {
	
	private String username;
	private String Name;
	private String Surname;
	private int Telephone;
	
	public Contact() {
		
	}

	@XmlElement(name = "Name")
	public String getName() {
		return Name;
	}

	public void setName(String nome) {
		this.Name= nome;
	}

	@XmlElement(name = "Surname")
	public String getSurname() {
		return Surname;
	}

	public void setSurname(String cognome) {
		this.Surname = cognome;
	}

	@XmlElement(name = "Telephone")
	public int getTelephone() {
		return Telephone;
	}

	public void setTelephone(int telephone) {
		this.Telephone = telephone;
	}
	
	@XmlElement(name = "username")
	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}
	
	
	

}
