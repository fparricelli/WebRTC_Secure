package it.utility;

public class MutableInteger {
	Integer integer;
	
	public MutableInteger() {
		this.setInteger(0);
	}
	
	public MutableInteger(Integer integer)
	{
		this.setInteger(integer);
	}

	public Integer getInteger() {
		return integer;
	}

	public void setInteger(Integer integer) {
		this.integer = integer;
	}
	
	@Override
	public String toString() {
	return this.getInteger().toString();
	}
}
