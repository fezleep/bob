package com.bob.shared.api;

import java.time.OffsetDateTime;
import java.util.List;

public record ApiErrorResponse(
        OffsetDateTime timestamp,
        int status,
        String error,
        String message,
        List<FieldErrorResponse> fields
) {

    public static ApiErrorResponse of(int status, String error, String message) {
        return new ApiErrorResponse(OffsetDateTime.now(), status, error, message, List.of());
    }

    public static ApiErrorResponse withFields(int status, String error, String message, List<FieldErrorResponse> fields) {
        return new ApiErrorResponse(OffsetDateTime.now(), status, error, message, fields);
    }
}
