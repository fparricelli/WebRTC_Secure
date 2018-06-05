var conn = new WebSocket("wss://localhost:12345");

conn.onopen = function () { 
	   console.log("Connesso al signaling server");
		
	   send({ 
	        type: "user_select", 
	        name: "Aldino_Strofaldino",
	        roleNumber: 3,
	        token: "eyJhbGciOiJSUzUxMiJ9.eyJpcCI6IjA6MDowOjA6MDowOjA6MSIsImlzcyI6InNlY3VyZV9tZXNzYWdpbmciLCJob3BzIjoxMCwiZXhwIjoxNTI3Nzg2MDM4LCJpYXQiOjE1Mjc3ODUxMzgsInVzZXJuYW1lIjoiYWxkb3BpcHBvIn0.d7BT7mtxaa5xwfsJxLuyOk78guInEaBTcZvHh2FnMpPbMi-SR9mylnYIv9LvYS7SmCNjuO1IbThkGhbgpmy5Lvbx10Ix9oLKiZtYjXKYb2ezuFJjJADca_8M9CtR7Xft68AiDIMS1NA551zr83aXA2aVEYtXEPSk9pr8SkZfyRRRIE_V8zzPhcckMydERdaM5O19rEaWLI8H_KhXkPxTpC-SPP1jah5sIDytjq7UN2mZ4YfYx4SpTaXSZw5WypImLFG6cvsUoJsORQ-sMHOzm2tvKHS9kwztKVLk56s_Tmr81tGFGXw95_htak9HkYe_wBL64gyuE1KA-On0kKPOFQ"
	  
	     }); 
	};
	

	
	

	
	
	
	function send(message) { 
 
			
		   conn.send(JSON.stringify(message)); 
		};