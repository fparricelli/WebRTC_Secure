var constants = require('./constants.js');
var utilities = require('./utilities.js');

module.exports = {
		
	findUser : function findUser(user, userlist){
			
			for(var i = 0;i<userlist.length;i++){
				
				if(userlist[i].name == user.name && userlist[i].roleNumber == user.roleNumber){
					return i;
				}
			}
			
			return -1;	
		},


	findLoggedUserByName : function findLoggedUserByName(name, userlist){
	
		for(var i = 0;i<userlist.length;i++){
			if(userlist[i].name == name){
			return i;
			}
		}
	
		return -1;
	
	},
	
	
	findConnectedUserByName : function findConnectedUserByName(name, connectedList){
		
		var u = connectedList[name];
		if(u != null){
			return u;
		}else{
			return -1;
		}
	},
	
	
	deleteLoggedUserByName : function deleteLoggedUserByName(name, loggedList){
		
		for(var i = 0;i<loggedList.length;i++){
			if(loggedList[i].name == name){
				loggedList.splice(i,1);
				return 0;
			}
		}
		
		return -1;
		
	},
	
	
	findConnection : function findConnection(connection, connectedList){
		
		for(var key in connectedList){
			if(connectedList[key] == connection){
				return key;
			}
		}

		return -1;
		
	},
	
	
	checkUserPresence :	function checkUserPresence(name, loggedList, connectedList){
		
		console.log("sto cercando:"+name);
		
		var log_u = module.exports.findLoggedUserByName(name, loggedList);
		var con_u = module.exports.findConnectedUserByName(name, connectedList); 
		
		console.log("pos logged:"+log_u);
		console.log("pos_conn:"+con_u);
		
		if(log_u != -1 && con_u != -1){
			return true;
		}else{
			return false;
		}
		
	},



checkUserToken : async function checkUserToken(token, list, role) {
		  return new Promise((resolve, reject) => {	    
			

			  console.log("Avvio check user token con:");
			  console.log("token:"+token);
			  console.log("ruolo:"+role);
			  console.log("list"+list);
			  
			  var querystring = require('querystring');
			  var https = require('https');
			  
			  
			  var post_data = querystring.stringify({
			      'token' : token,
			      'list': list,
			      'ruolo': role,
			      'option': 1
			  });
			  
			  var post_options = {
				      
					  host: constants.tomcat_host,
				      port: constants.tomcat_port,
				      path: utilities.getPaths(list),
				      method: 'POST',
				      rejectUnauthorized: false,
				      headers: {
				          'Content-Type': 'application/x-www-form-urlencoded',
				          'Content-Length': Buffer.byteLength(post_data)
				      }
			  		  
				  };
			  
			
			  var post_req = https.request(post_options, function(res) {
			      res.setEncoding('utf8');
			      console.log("statusCode: ", res.statusCode); 
			      console.log("new token: ", res.headers.newtoken);
			      
			      if(res.statusCode == 200){
			    	  
			    	  console.log("Permesso accordato!");
			    	  var res = {result:constants.PERMIT, newtoken:res.headers.newtoken};
			    	  resolve(res);
			    	  
			      }else if(res.statusCode == 401){
			    	  
			    	  console.log("Permesso negato!");
			    	  var res = {result:constants.DENY, newtoken:res.headers.newtoken};
			    	  resolve(res);
			    	  
			    	  
			      }else if(res.statusCode == 307){
			    	  
			    	  console.log("Token Scaduto");
			    	  var res = {result:constants.TOKEN_EXPIRED};
			    	  resolve(res);
			          	  
			     }else{
			    	 
			    	 console.log("Errore!");
			    	 var res = {result:constants.ERROR};
			    	 reject(res);
			    	  
			      }
			      
			     
			  });
			  
			  post_req.on('error', function(e){
			       console.log("Error:"+e);
			       var res = {res:constants.ERROR};
			       reject(res);
			    });
			  
			  
			// post data
			  post_req.write(post_data);
			  post_req.end();

			 
		  
		  });
		  
	}	
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
}