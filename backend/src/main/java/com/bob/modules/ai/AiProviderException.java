package com.bob.modules.ai;

public class AiProviderException extends RuntimeException {

    private final Category category;

    public AiProviderException(String message, Category category, Throwable cause) {
        super(message, cause);
        this.category = category;
    }

    public Category category() {
        return category;
    }

    public enum Category {
        PROVIDER_ERROR,
        PARSING_ERROR
    }
}
