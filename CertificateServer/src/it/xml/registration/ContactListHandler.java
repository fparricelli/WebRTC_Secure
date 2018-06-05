package it.xml.registration;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;

import javax.servlet.ServletConfig;
import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;
import javax.xml.bind.Marshaller;
import javax.xml.bind.Unmarshaller;


public class ContactListHandler {
	
	private ServletConfig c;
	
	private volatile static ContactListHandler instance = null;
	public final static String path = "/contact-lists/utenti/utenti-list.xml";
	private String realPath;
	
	public static ContactListHandler getInstance(ServletConfig c) {
		if (instance == null) {
			
			synchronized(ContactListHandler.class) {
				
				if(instance == null) {
					instance = new ContactListHandler(c);
				}
			
			}
		}

	return instance;

	}
	
	
	private ContactListHandler(ServletConfig c) {
		
		this.realPath = c.getServletContext().getRealPath(path);
		
	}
	
	
	public synchronized void writeToXML(String username, String name, String surname, int telephone) throws JAXBException{
		
		JAXBContext context = JAXBContext.newInstance(ContactList.class);
		Unmarshaller unmarshaller = context.createUnmarshaller();
		ContactList cList = (ContactList) unmarshaller.unmarshal(new File(this.realPath));
		
		Contact c = new Contact();
		c.setUsername(username);
		c.setName(name);
		c.setSurname(surname);
		c.setTelephone(telephone);
		
		cList.getContacts().add(c);
		
		context = JAXBContext.newInstance(ContactList.class);
		Marshaller marshaller = context.createMarshaller();

		
		marshaller.setProperty(Marshaller.JAXB_FORMATTED_OUTPUT,Boolean.TRUE);

	
		marshaller.marshal(cList, new File(this.realPath));
		

		System.out.println("[DEBUG - CONTACT-LIST]:");
		marshaller.marshal(cList, System.out);		
		
		
	}
	
	
	
	
	
	
	
	

}
