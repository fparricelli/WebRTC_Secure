package it.xml.registration;
import java.util.List;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;


@XmlRootElement(name = "ContactList")
public class ContactList {

	private List<Contact> contacts;
	
	public ContactList() {
		
	}
	
	public List<Contact> getContacts(){
		return this.contacts;
	}
	
	@XmlElement(name = "Contact")
	public void setContacts(List<Contact> c) {
		this.contacts = c;
	}
	
}
