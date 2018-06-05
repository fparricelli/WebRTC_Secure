package it.sm.keystore.rsakeystore;

import it.sm.keystore.MyKeystore;

/* Keystore RSA: oltre alle funzioni base di cifratura/decifratura deve consentire
 * la possibilità di calcolare la firma di un messaggio usando la chiave privata
 * contenuta nel keystore.
 */

public interface MyRSAKeystore extends MyKeystore{
	
	public byte [] sign(byte [] messageBytes, String alg) throws Exception;

}
