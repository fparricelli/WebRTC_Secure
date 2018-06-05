package it.sm.keystore;

//Keystore base, fornisce operazioni di cifratura e decifratura

public interface MyKeystore {

	public byte [] encrypt(byte [] bytesToEncrypt) throws Exception;
	public byte [] decrypt(byte [] bytesToDecrypt) throws Exception;
	
}
