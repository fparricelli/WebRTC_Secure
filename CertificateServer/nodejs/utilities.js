var constants = require('./constants.js');
const fs = require('fs');
const crypto = require('crypto');

module.exports = {
		
 fileHash : async function fileHash(algorithm = constants.hash_alg) {
			  return new Promise((resolve, reject) => {	    
				
				  fs.readFile(constants.key_path, 'utf8', function(err, data) {
					  if (err) throw err;
					  
					  console.log("[HASH CHECK] Leggo: "+data);
					});
				 
				  
			    let shasum = crypto.createHash(algorithm);
			    try {
			      let s = fs.ReadStream(constants.key_path);
			      s.on('data', function (data) {
			        shasum.update(data);
			      })
			      
			      s.on('end', function () {
			        const hash = shasum.digest('base64');
			        return resolve(hash);
			      })
			    } catch (error) {
			      return reject(constants.ERROR);
			    }
			  });
		},
		
		
		
getPaths : function getPaths(list){
			
			if(list == 1){
				return constants.admin_list_path;
			}else if(list == 2){
				return constants.tech_list_path;
			}else{
				return constants.user_list_path;
			}
		},
		
		
		
	


 

		
		
		
		
		
		
		
		
		
		
}