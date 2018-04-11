package com.al.lte.portal.common.mapper;

import org.apache.commons.lang3.StringEscapeUtils;
import org.codehaus.jackson.SerializableString;
import org.codehaus.jackson.io.CharacterEscapes;
import org.codehaus.jackson.io.SerializedString;
import org.codehaus.jackson.map.ObjectMapper;
import org.springframework.beans.factory.FactoryBean;

public class HtmlEscapingObjectMapperFactory implements FactoryBean<ObjectMapper> {

    private final ObjectMapper objectMapper;

    public HtmlEscapingObjectMapperFactory() {
        objectMapper = new ObjectMapper();
        objectMapper.getJsonFactory().setCharacterEscapes(new HTMLCharacterEscapes());
    }

    public ObjectMapper getObject() throws Exception {
        return objectMapper;
    }

    public Class<?> getObjectType() {
        return ObjectMapper.class;
    }

    public boolean isSingleton() {
        return true;
    }

    public static class HTMLCharacterEscapes extends CharacterEscapes {

        private final int[] asciiEscapes;

        public HTMLCharacterEscapes() {
            // start with set of characters known to require escaping (double-quote, backslash etc)
            asciiEscapes = CharacterEscapes.standardAsciiEscapesForJSON();
            // and force escaping of a few others:
            asciiEscapes['<'] = CharacterEscapes.ESCAPE_CUSTOM;
            asciiEscapes['>'] = CharacterEscapes.ESCAPE_CUSTOM;
            asciiEscapes['&'] = CharacterEscapes.ESCAPE_CUSTOM;
            asciiEscapes['"'] = CharacterEscapes.ESCAPE_CUSTOM;
            asciiEscapes['\''] = CharacterEscapes.ESCAPE_CUSTOM;
        }

        @Override
        public int[] getEscapeCodesForAscii() {
            return asciiEscapes;
        }

        // and this for others; we don't need anything special here
        @Override
        public SerializableString getEscapeSequence(int ch) {
            return new SerializedString(StringEscapeUtils.escapeHtml4(Character.toString((char) ch)));

        }
    }
}
