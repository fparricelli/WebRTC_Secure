Avendo abilitato SSL anche per il server nodeJS, è necessario aggiungere il certificato che trovate nella cartella CertificateServer/secure_place/tomcat.crt
Per fare questo, navigate fino alla directory:
	<Java JDK>/<Java JRE>/lib/security (se usate la JDK)
	<Java JRE>/lib/security (se usate la JRE)
	(Assicuratevi che la cartella JDK/JRE su cui operate sia la stessa che viene vista da eclipse come Java Runtime)
	
	Dopodichè, una volta nella cartella, copiateci dentro il file tomcat.crt e digitate il seguente comando:
	
	keytool -import -alias tomcat_nodejs (o qualunque alias vogliate) -file tomcat.crt -keystore cacerts -storepass changeit
	
	Per verificare che sia stato importato correttamente, digitate:
	
	keytool -list -keystore cacerts -alias <alias utilizzato>
	
	Come ultimo passo, una nota se usate Firefox: al contrario di Chrome che mi chiede se accettarlo o meno, Firefox mi blocca automaticamente tutti i certificati self-signed.
	Per abilitarli, è necessario andare in opzioni>Sicurezza>Certificati> e nella tab 'Servers' aggiungere un'eccezione per https://localhost:12345 (server nodejs) e https://localhost:8443 (tomcat)
