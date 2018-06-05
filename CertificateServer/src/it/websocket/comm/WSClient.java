package it.websocket.comm;

import java.net.URI;
import java.nio.ByteBuffer;
import org.java_websocket.client.WebSocketClient;
import org.java_websocket.handshake.ServerHandshake;
import org.json.JSONObject;

public class WSClient extends WebSocketClient {

	private JSONObject msg;

	public WSClient(URI serverURI, JSONObject msg) {
		super(serverURI);
		this.msg = msg;
	}

	@Override
	public void onOpen(ServerHandshake handshakedata) {
		
		System.out.println("[WS Client - Debug] Connesso a signaling server.");
			
		System.out.println("[WS Client - Debug] Invio JSON:"+msg);
		
		send(msg.toString());
	}

	@Override
	public void onClose(int code, String reason, boolean remote) {
		System.out.println("[WS Client - Debug] Chiudo!");
	}

	@Override
	public void onMessage(String message) {
		System.out.println("[WS Client - Debug] Ricevuto messaggio:"+message);
		this.close();
	}

	@Override
	public void onMessage(ByteBuffer message) {
		System.out.println("[WS Client - Debug] received ByteBuffer");
	}

	@Override
	public void onError(Exception ex) {
		System.err.println("[WS Client - Debug] Errore:"+ex.getMessage());
		this.close();
	}

}