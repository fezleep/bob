package com.bob.modules.system;

public record SystemStatusResponse(
        String appName,
        String status,
        String version
) {
}
