package com.ailk.ecsp.intf.webservice;



import java.io.ByteArrayInputStream;
import java.io.InputStream;

import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.util.EntityUtils;

import com.ailk.ecsp.intf.httpclient.HttpclientContainer;
import com.eviware.soapui.impl.wsdl.support.wsdl.WsdlLoader;



public class HttpclientWsdlLoader extends WsdlLoader {

	public HttpclientWsdlLoader(String url) {
		super(url);
		// TODO Auto-generated constructor stub
	}

	public void close() {
		// TODO Auto-generated method stub

	}

	@Override
	public boolean abort() {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	public boolean isAborted() {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	public InputStream load(String url) throws Exception {
		
		HttpGet get = new HttpGet(url);
		ByteArrayInputStream bi = null;
		
		HttpResponse httpResponse = HttpclientContainer.getInstance().getHttpClient().execute(get);
		HttpEntity entity = httpResponse.getEntity();
		bi = new ByteArrayInputStream(EntityUtils.toByteArray(entity));
		
		get.abort();
		
		if (null != entity) {
			EntityUtils.consume(entity);
		}
			
		return bi;
		
	}

}
