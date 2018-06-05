package it.registration;

import java.io.IOException;
import java.sql.SQLException;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.xml.bind.JAXBException;

import it.exception.BadRequestException;
import it.exception.registration.MailAlreadyExistsException;
import it.exception.registration.TelephoneAlreadyExistsException;
import it.exception.registration.UserAlreadyExistsException;
import it.utility.network.HTTPCodesClass;
import it.utility.network.HTTPCommonMethods;
import it.xml.registration.ContactListHandler;

public class RegistrationServlet extends HttpServlet {

	/**
	 * Vi si accede : https://localhost:8443/CertificateServer/register/
	 */
	private static final long serialVersionUID = 3287889096339954784L;
	private ServletConfig config;

	public RegistrationServlet() {
		super();
	}

	public void init(ServletConfig config) throws ServletException {
		this.config = config;
	}

	/*
	 * Il do post restituisce:
	 * 
	 * 200 - Registrazione a buon fine 409 - Username o mail già presente 500 -
	 * errore interno al server NIENTE: IOException (non-Javadoc)
	 * 
	 * @see
	 * javax.servlet.http.HttpServlet#doPost(javax.servlet.http.HttpServletRequest,
	 * javax.servlet.http.HttpServletResponse)
	 */

	protected void doPost(HttpServletRequest request, HttpServletResponse response) {
		Integer httpCode = null;
		String username = request.getParameter("username");
		String password = request.getParameter("password");
		String name = request.getParameter("name");
		String surname = request.getParameter("surname");
		String email = request.getParameter("email");
		Integer telephone = Integer.valueOf(request.getParameter("telephone"));
		try {
			checkBadRequest(username, password, name, surname, email, telephone);
			System.out.println(
					"Arrivata richiesta; " + username + " " + name + " " + surname + " " + email + " " + telephone);
			RegistrationLogic.store(username, password, email, name, surname, telephone);
			httpCode = HTTPCodesClass.SUCCESS;
			System.out.println("DEBUG: Richiesta con successo");

			ContactListHandler clh = ContactListHandler.getInstance(config);
			clh.writeToXML(username, name, surname, telephone);

			HTTPCommonMethods.sendReplyHeaderOnly(response, httpCode);
		}
		
		catch(BadRequestException e)
		{
			httpCode = e.getHttpCode();
			try {
				System.out.println("DEBUG: PARAMETRI MANCANTI " + httpCode);
				HTTPCommonMethods.sendReplyHeaderOnly(response, httpCode);
			} catch (IOException e1) {
				// TODO Auto-generated catch block
				e1.printStackTrace();
			}
		}
		
		catch(TelephoneAlreadyExistsException e)
		{

			httpCode = e.getHttpCode();
			try {
				System.out.println("DEBUG: Telefono già esistente");
				HTTPCommonMethods.sendReplyHeaderOnly(response, httpCode);
			} catch (IOException e1) {
				// TODO Auto-generated catch block
				e1.printStackTrace();
			}
		}

		catch (UserAlreadyExistsException e) {
			System.out.println("DEBUG: Utente esistente");
			httpCode = e.getHttpCode();
			try {
				System.out.println("DEBUG: Invio una risposta con codice: " + httpCode);
				HTTPCommonMethods.sendReplyHeaderOnly(response, httpCode);
			} catch (IOException e1) {
				// TODO Auto-generated catch block
				e1.printStackTrace();
			}
		}

		catch (MailAlreadyExistsException e) {
			System.out.println("DEBUG: Mail esistente");
			httpCode = e.getHttpCode();
			try {
				HTTPCommonMethods.sendReplyHeaderOnly(response, httpCode);
			} catch (IOException e1) {
				// TODO Auto-generated catch block
				e1.printStackTrace();
			}
		}

		catch (SQLException | JAXBException e) {
			System.out.println("DEBUG: Errore interno");
			httpCode = HTTPCodesClass.SERVER_ERROR;
			try {
				HTTPCommonMethods.sendReplyHeaderOnly(response, httpCode);
			} catch (IOException e1) {
				// TODO Auto-generated catch block
				e1.printStackTrace();
			}
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

	}

	public void checkBadRequest(String username, String password, String name, String surname, String email,
			Integer telephone) throws BadRequestException {
		if (username == null || username.isEmpty() || password == null || password.isEmpty() || name == null
				|| name.isEmpty() || email == null || email.isEmpty() || telephone == null) {
			throw new BadRequestException();
		}
	}
	

}
