package com.ailk.ecsp.core.container;

public class ContainerFactory {
	
	private static Container container;
	
	private ContainerFactory() {
		// TODO Auto-generated constructor stub
	}
	
	public static Container getInstance() {
		
		if(container == null) {
			container = new StandordContainer();
		}
		return container;
	}
	
}
