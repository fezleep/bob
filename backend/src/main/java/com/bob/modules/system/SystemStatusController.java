package com.bob.modules.system;

import com.bob.config.ApplicationInfoProperties;
import com.bob.modules.ai.AiProperties;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/status")
public class SystemStatusController {

    private final ApplicationInfoProperties applicationInfo;
    private final AiProperties aiProperties;

    public SystemStatusController(ApplicationInfoProperties applicationInfo, AiProperties aiProperties) {
        this.applicationInfo = applicationInfo;
        this.aiProperties = aiProperties;
    }

    @GetMapping
    public SystemStatusResponse status() {
        return new SystemStatusResponse(
                applicationInfo.name(),
                "ok",
                applicationInfo.version(),
                aiProperties.configured(),
                "in-memory",
                true
        );
    }
}
