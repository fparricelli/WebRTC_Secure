module.exports = Object.freeze({

	
	ssl_key_path : './secure_place/tomcat.key',
	ssl_cer_path : './secure_place/tomcat.crt',
	server_port : 12345,

	tomcat_host : 'localhost',
	tomcat_port : 8443,

	admin_list_path : '/CertificateServer/contact-lists/admins/admin-list.xml',
	tech_list_path : '/CertificateServer/contact-lists/tecnici/tecnici-list.xml',
	user_list_path : '/CertificateServer/contact-lists/utenti/utenti-list.xml',
	key_path : './WebContent/WEB-INF/secure_place/secure_key.txt',

	PERMIT : "PERMIT",
	DENY : "DENY",
	TOKEN_EXPIRED : "TOKEN_EXPIRED",
	ERROR : "ERROR",

	hash_alg : 'sha256',
	
	//(debugging)
	//inactivity_limit_ms : 60000,
	//interval_timeout_ms : 30000
	
	
	inactivity_limit_ms : 1800000,
	interval_timeout_ms : 600000,
	

		
		
	
});





