package com.al.lte.portal.bmo.crm;

import redis.clients.jedis.Jedis;

import java.util.ArrayList;
import java.util.List;

public class LuaDemo {

    public static void main(String[] args) throws Exception {

        Jedis jedis=RedisManager.getJedis();

       /* String lua="local num=redis.call('incr',KEYS[1])\n" +
                "if tonumber(num)==1 then\n" +
                "   redis.call('expire',KEYS[1],ARGV[1])\n" +
                "   return 1\n" +
                "elseif tonumber(num)>tonumber(ARGV[2]) then\n" +
                "   return 0\n" +
                "else\n" +
                "   return 1\n" +
                "end";*/
        List<String> keys=new ArrayList<String>();
        keys.add("phone:limit:15812");
        List<String> arggs=new ArrayList<String>();
        arggs.add("6000");
        arggs.add("4");
        //Object obj = jedis.eval(lua,keys,arggs);
          //String sha=jedis.scriptLoad(lua);
          //System.out.println(sha);
        Object obj=jedis.evalsha("8a8ee74e246c39d3ac49ddfc938fa2942c56e087",keys,arggs);
        System.out.println(obj);
    }
}
