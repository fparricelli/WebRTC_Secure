package it.authentication.twosteps;

import java.io.IOException;
import java.sql.SQLException;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import it.exception.twofactors.NoValidCodeExists;
import it.utility.database.DatabaseUtility;
import it.utility.network.HTTPCodesClass;
import it.utility.network.HTTPCommonMethods;

public class TwoStepsServlet extends HttpServlet {

	@Override
	protected void doPost(HttpServletRequest request, HttpServletResponse response) {
		Integer httpCode = 0;
		try {
			String username = request.getParameter("username");
			String code = request.getParameter("code");
			System.out.println("Richiesta: " + username + " " + code);

			synchronized (DatabaseUtility.class) {
				boolean rightCode = TwoStepsLogic.handleCode(username, request.getRemoteAddr(), code);
				if (rightCode) {
					httpCode = HTTPCodesClass.SUCCESS;
					HTTPCommonMethods.sendReplyHeaderOnly(response, httpCode);
				}

				else {
					httpCode = HTTPCodesClass.UNAUTHORIZED;
					HTTPCommonMethods.sendReplyHeaderOnly(response, httpCode);
				}
			}
		} catch (SQLException e) {
			httpCode = HTTPCodesClass.SERVER_ERROR;
			try {
				HTTPCommonMethods.sendReplyHeaderOnly(response, httpCode);
			} catch (IOException e1) {
				// TODO Auto-generated catch block
				e1.printStackTrace();
			}
			e.printStackTrace();

		} catch (NoValidCodeExists e) {
			httpCode = HTTPCodesClass.NOT_FOUND;
			try {
				HTTPCommonMethods.sendReplyHeaderOnly(response, httpCode);
			} catch (IOException e1) {
				// TODO Auto-generated catch block
				e1.printStackTrace();
			}
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
}
