package com.bob.modules.system;

import com.bob.config.ApplicationInfoProperties;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/status")
public class SystemStatusController {

    private final ApplicationInfoProperties applicationInfo;

    public SystemStatusController(ApplicationInfoProperties applicationInfo) {
        this.applicationInfo = applicationInfo;
    }

    @GetMapping
    public SystemStatusResponse status() {
        return new SystemStatusResponse(
                applicationInfo.name(),
                "ok",
                applicationInfo.version()
        );
    }
}
