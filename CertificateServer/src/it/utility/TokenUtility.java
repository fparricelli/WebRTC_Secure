package it.utility;

public class TokenUtility {
	
	public static boolean compareTokens (String token1, String token2)
	{
	if(token1.length()!=token2.length())
	{
		return false;
	}
		
	 for(int i=0; i<token1.length() && i<token2.length(); i++)
	 {
		 if(token1.charAt(i)!=token2.charAt(i))
		 {
			 return false;
		 }
	 }
		
		
		return true;
	}

}
