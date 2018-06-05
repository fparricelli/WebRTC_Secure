CREATE DATABASE  IF NOT EXISTS `secure_messaging` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `secure_messaging`;
-- MySQL dump 10.13  Distrib 5.7.17, for Win64 (x86_64)
--
-- Host: localhost    Database: secure_messaging
-- ------------------------------------------------------
-- Server version	5.7.19-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `account_lockdown`
--

DROP TABLE IF EXISTS `account_lockdown`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `account_lockdown` (
  `lockdown_username` varchar(100) NOT NULL,
  `ip` varchar(45) NOT NULL,
  `starting` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`lockdown_username`,`ip`,`starting`),
  CONSTRAINT `lockdown_username` FOREIGN KEY (`lockdown_username`) REFERENCES `users` (`username`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `account_lockdown`
--

LOCK TABLES `account_lockdown` WRITE;
/*!40000 ALTER TABLE `account_lockdown` DISABLE KEYS */;
INSERT INTO `account_lockdown` VALUES ('Luca','127.0.0.1','2017-12-19 18:34:45'),('paperino','127.0.0.1','2017-12-19 18:34:33'),('topolino','127.0.0.1','2017-12-19 18:34:42'),('wewe','127.0.0.1','2017-12-19 18:34:39');
/*!40000 ALTER TABLE `account_lockdown` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER update_lockdown_history AFTER INSERT ON ACCOUNT_LOCKDOWN FOR EACH ROW
BEGIN
INSERT IGNORE INTO LOCKDOWN_HISTORY VALUES (NEW.LOCKDOWN_USERNAME,NEW.IP);
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `failed_logins`
--

DROP TABLE IF EXISTS `failed_logins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `failed_logins` (
  `username_failed` varchar(100) NOT NULL,
  `ip` varchar(45) NOT NULL,
  `attempts` int(11) NOT NULL,
  `first_attempt` datetime NOT NULL,
  PRIMARY KEY (`username_failed`,`ip`),
  CONSTRAINT `username` FOREIGN KEY (`username_failed`) REFERENCES `users` (`username`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `failed_logins`
--

LOCK TABLES `failed_logins` WRITE;
/*!40000 ALTER TABLE `failed_logins` DISABLE KEYS */;
INSERT INTO `failed_logins` VALUES ('ciao','0:0:0:0:0:0:0:1',3,'2018-05-31 17:18:26'),('Luca','127.0.0.1',5,'2017-12-19 19:34:43'),('paperino','127.0.0.1',5,'2017-12-19 19:34:30'),('topolino','127.0.0.1',5,'2017-12-19 19:34:40'),('wewe','127.0.0.1',5,'2017-12-19 19:34:37');
/*!40000 ALTER TABLE `failed_logins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lockdown_history`
--

DROP TABLE IF EXISTS `lockdown_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `lockdown_history` (
  `username` varchar(100) NOT NULL,
  `ip` varchar(45) NOT NULL,
  PRIMARY KEY (`username`,`ip`),
  CONSTRAINT `username_history` FOREIGN KEY (`username`) REFERENCES `users` (`username`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lockdown_history`
--

LOCK TABLES `lockdown_history` WRITE;
/*!40000 ALTER TABLE `lockdown_history` DISABLE KEYS */;
INSERT INTO `lockdown_history` VALUES ('aldo','127.0.0.1'),('bob','127.0.0.1'),('casola','127.0.0.1'),('linux','127.0.0.1'),('Luca','127.0.0.1'),('paperino','127.0.0.1'),('pepp','127.0.0.1'),('topolino','127.0.0.1'),('username','127.0.0.1'),('wewe','127.0.0.1'),('wewe2','127.0.0.1'),('wewe3','127.0.0.1'),('wewe4','127.0.0.1');
/*!40000 ALTER TABLE `lockdown_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lockdown_ips`
--

DROP TABLE IF EXISTS `lockdown_ips`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `lockdown_ips` (
  `ip` varchar(45) NOT NULL,
  `failed` int(11) NOT NULL,
  `starting` datetime NOT NULL,
  PRIMARY KEY (`ip`,`starting`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lockdown_ips`
--

LOCK TABLES `lockdown_ips` WRITE;
/*!40000 ALTER TABLE `lockdown_ips` DISABLE KEYS */;
INSERT INTO `lockdown_ips` VALUES ('127.0.0.1',5,'2017-12-19 19:34:33');
/*!40000 ALTER TABLE `lockdown_ips` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mail_codes`
--

DROP TABLE IF EXISTS `mail_codes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `mail_codes` (
  `username` varchar(100) NOT NULL,
  `IP` varchar(45) NOT NULL,
  `issued` datetime NOT NULL,
  `value` varchar(64) NOT NULL,
  PRIMARY KEY (`username`,`IP`),
  CONSTRAINT `username_mail` FOREIGN KEY (`username`) REFERENCES `users` (`username`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mail_codes`
--

LOCK TABLES `mail_codes` WRITE;
/*!40000 ALTER TABLE `mail_codes` DISABLE KEYS */;
INSERT INTO `mail_codes` VALUES ('casola','127.0.0.1','2017-12-16 00:15:24','fd65cc2fa763785543c18bdaa8cfbaea1c1087506574f3d79d1580f9ee1373bf'),('CiaoOOOO','127.0.0.1','2018-06-02 19:10:15','c13664f01c04208e7198ca30420caa33a84f8f57086acb465e1325961db30959'),('parricells','127.0.0.1','2017-12-16 00:14:53','9562eedb5468bfbe591165530f795e18e734f4b2dbb8ece87c0e6026477e1401'),('spr','0:0:0:0:0:0:0:1','2018-05-31 19:33:44','e1d870d9d9d964a98a11a996a8e5454cb737f0ccdfa1cfe0561bbfb0ffc972e4'),('spr','127.0.0.1','2018-06-02 19:44:32','ea21340f4e3977aee56d087d9d39678ca6c68cdd873ded33193f7f5796c6157a'),('username','0:0:0:0:0:0:0:1','2018-05-29 22:49:49','bb499bf94f30c7c96c99b8a9da077dad57fdee2b048823ab1b985cdae2fa924b'),('username','127.0.0.1','2017-12-18 20:26:42','d16210b3f8422fb05f29d85495f0359e035d6d44ecf5ec52a85c9a683e175fd1'),('wewe','127.0.0.1','2017-12-14 22:51:30','6258a5e0eb772911d4f92be5b5db0e14511edbe01d1d0ddd1d5a2cb9db9a56ba');
/*!40000 ALTER TABLE `mail_codes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `malicious_ip`
--

DROP TABLE IF EXISTS `malicious_ip`;
/*!50001 DROP VIEW IF EXISTS `malicious_ip`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `malicious_ip` AS SELECT 
 1 AS `IP`,
 1 AS `DIFFERENT USERS FAILED`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `roles` (
  `name` varchar(20) NOT NULL,
  PRIMARY KEY (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES ('admin'),('tecnico'),('utente');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trusted_devices`
--

DROP TABLE IF EXISTS `trusted_devices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `trusted_devices` (
  `username` varchar(100) NOT NULL,
  `ip` varchar(45) NOT NULL,
  PRIMARY KEY (`username`,`ip`),
  CONSTRAINT `users_device` FOREIGN KEY (`username`) REFERENCES `users` (`username`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trusted_devices`
--

LOCK TABLES `trusted_devices` WRITE;
/*!40000 ALTER TABLE `trusted_devices` DISABLE KEYS */;
INSERT INTO `trusted_devices` VALUES ('bob','127.0.0.1'),('Luca','127.0.0.1'),('pippozzo','0:0:0:0:0:0:0:1'),('username','0:0:0:0:0:0:0:1'),('username','127.0.0.1'),('wewe','127.0.0.1');
/*!40000 ALTER TABLE `trusted_devices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `username` varchar(100) NOT NULL,
  `password` varchar(60) NOT NULL,
  `name` varchar(45) DEFAULT NULL,
  `surname` varchar(45) DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `telephone` int(11) NOT NULL,
  `role` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`username`),
  UNIQUE KEY `email_UNIQUE` (`email`),
  UNIQUE KEY `telephone_UNIQUE` (`telephone`),
  KEY `user_role_idx` (`role`),
  CONSTRAINT `user_role` FOREIGN KEY (`role`) REFERENCES `roles` (`name`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('aldo','$2a$12$tpfplMs0JaMdJ3naIdAQWuNnzbaORIC/AuhV8GyV2I.u3Zx2lipri','Aldo','Strofaldi','e',200,'admin'),('bob','$2a$12$tpfplMs0JaMdJ3naIdAQWuNnzbaORIC/AuhV8GyV2I.u3Zx2lipri','Bob','Aggiustatutto','e1',16002,'tecnico'),('casola','$2a$12$tpfplMs0JaMdJ3naIdAQWuNnzbaORIC/AuhV8GyV2I.u3Zx2lipri','Valentina','Casola','ssdcasola@gmail.com',12358,'admin'),('ciao','$2a$12$8JNsKECFJLhxm6jfMpNZH..wg6jslGq/CAtXeqfXsNacDtn/aaAD2','u','l','m',138,'utente'),('CiaoOOOO','$2a$12$c0.EJ5mpvy7/CEATJsGyUuQ6QSA/zV1H0bVMTQxnoQwC2dOuwmg3C','e','e','uz',12000,'utente'),('Incognito1@','$2a$12$72c9nteJ3hQVWdhf79KLgOC/GLqSKvTyx1dJRMTPEwRzAgJniF5iW','NonTe','LoDico','fattifattituoi@suspiciousmail.it',4556897,'utente'),('linux','$2a$12$tpfplMs0JaMdJ3naIdAQWuNnzbaORIC/AuhV8GyV2I.u3Zx2lipri','Linus','Torvalds','u',207,'tecnico'),('Luca','$2a$12$ApIUXvhm0dgk758J5hmi7ubSMRovxifwNqYeNh6I/pUVslNsw6LrC','Luca','Pirozzi','luca.pirozzi3@gmail.com',14325,'admin'),('Nome utente','$2a$12$JtiY7dI2Rs/5P9i4dSYAdOXG4/pQAKINkdnYgKdnkbAHleBvR4yxS',NULL,NULL,'k',13578,NULL),('nwoegnewnginn','$2a$12$mLZThHSUQL8.V9HEy1a6Su1s1llgmjf1mFW3.NUBbqpRxq8.k2msW',NULL,NULL,'n',14358,NULL),('Panzerotto','$2a$12$6pFWtnK0ojSaW.8UaN4nUOt437S7e8.LneWStf8kyc9yXJqmvbKRS','Pan','Zerotto','panzerotto@panzerottmailprovider.com',45658,'utente'),('paperino','$2a$12$tpfplMs0JaMdJ3naIdAQWuNnzbaORIC/AuhV8GyV2I.u3Zx2lipri','Donald ','Duck','z',16000,'utente'),('parricells','$2a$12$tpfplMs0JaMdJ3naIdAQWuNnzbaORIC/AuhV8GyV2I.u3Zx2lipri','Francesco','Parricelli','francesco.parricelli@gmail.com',14328,'utente'),('pepp','$2a$12$tpfplMs0JaMdJ3naIdAQWuNnzbaORIC/AuhV8GyV2I.u3Zx2lipri','Peppe','Barra','e2',204,'admin'),('pippozzo','$2a$12$EoJz12pz.s4vBysugYoS3u.1Dtg6UKvjppiGtZbyEyzpMStJcuOWe','Pippo','Pippozzo','theeagleone1@gmail.com',9,'utente'),('Pizza','$2a$12$B2it3Fnkm3JWKbR8OrAKWOVll4Yz/drOyQAataPYS/mE4cNExThH6','Pizza','Pizza','pizza@pizza.pizza',2354,'utente'),('Questo','$2a$12$N/htUPF0bVNfT.0TNVEjR.9L18MOg0LP3OL999/1YSPuheL.bd7Y.',NULL,NULL,'e3',14312,NULL),('spr','$2a$12$gE0sCftqAwCSrEujVGd7zu4UC4oOt0DxFcoOWK0nlwZfPo/.2wrVW','Simon Pietro','Romano','simonpietroromano@gmail.com',7,'utente'),('tizio','hash',NULL,NULL,'e4',12379,NULL),('topolino','$2a$12$tpfplMs0JaMdJ3naIdAQWuNnzbaORIC/AuhV8GyV2I.u3Zx2lipri','Mickey','Mouse','z2',211,'utente'),('Untizio','$2a$12$v8THmPyy7fQu71MrNw4zDeAaH1bJSaprLoX7dQuCgko2yrJZGBcNS',NULL,NULL,'k5',14389,NULL),('username','$2a$12$tpfplMs0JaMdJ3naIdAQWuNnzbaORIC/AuhV8GyV2I.u3Zx2lipri','User','Nam','luca.pirozzi2@gmail.com',590,'utente'),('wewe','$2a$12$WQmASg/O7zN6bFTg84zDJOjoY5J61m/4EPDp0r2v1yI/Kucsmn3y2',NULL,NULL,'k559',15900,NULL),('wewe2','$2a$12$oxTZWwTNbGjgODm9LBTsT.BsnwR.cot4p7f0wzVO6d1vId6g6nLYC',NULL,NULL,'lzpq',12389,NULL),('wewe3','$2a$12$VyX9gZDpNrvAJi3AT8.V0OX05skTWbKuf64j7t9e4pRDakqY6IfR2',NULL,NULL,'ijifjwiog',13478,NULL),('wewe4','$2a$12$KSCqyoEA6hGVnFhV.oRgOOJNTOn63wTAsMpqsXYdc4nze9Qyd4wsa',NULL,NULL,'iob4io4',12280,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'secure_messaging'
--

--
-- Dumping routines for database 'secure_messaging'
--

--
-- Final view structure for view `malicious_ip`
--

/*!50001 DROP VIEW IF EXISTS `malicious_ip`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8 */;
/*!50001 SET character_set_results     = utf8 */;
/*!50001 SET collation_connection      = utf8_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `malicious_ip` AS select `lockdown_history`.`ip` AS `IP`,count(0) AS `DIFFERENT USERS FAILED` from `lockdown_history` group by `lockdown_history`.`ip` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2018-06-03 15:17:28
