package it.utility;

public class MutableBoolean {
	
	private Boolean flag;

	public Boolean isFlag() {
		return flag;
	}

	public void setFlag(boolean flag) {
		this.flag = flag;
	}
	
	public MutableBoolean(Boolean flag) {
this.flag = flag;	}
@Override
public String toString() {
	return this.isFlag().toString();}


}
