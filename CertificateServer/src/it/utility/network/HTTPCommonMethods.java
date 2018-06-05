package it.utility.network;

import java.io.IOException;
import java.io.OutputStream;

import javax.servlet.http.HttpServletResponse;

public class HTTPCommonMethods {
	public static void sendReplyHeaderOnly(HttpServletResponse resp, Integer http) throws IOException {
		OutputStream out = resp.getOutputStream();
		resp.setStatus(http);
		out.flush();
	}
	
	public static void sendReplyHeaderWithToken(HttpServletResponse resp, Integer http, String newToken) throws IOException{
		OutputStream out = resp.getOutputStream();
		resp.addHeader("NewToken", newToken);
		resp.setStatus(http);
		out.flush();
	}

}
