package com.bob.modules.ai;

import org.springframework.stereotype.Component;

import java.time.Clock;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.Comparator;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

@Component
class InMemoryLeadInsightCache implements LeadInsightCache {

    private static final int MAX_ENTRIES = 500;
    private static final Duration TTL = Duration.ofHours(6);

    private final ConcurrentMap<String, LeadInsightCacheEntry> entries = new ConcurrentHashMap<>();
    private final Clock clock;

    InMemoryLeadInsightCache(Clock clock) {
        this.clock = clock;
    }

    @Override
    public Optional<LeadInsightCacheEntry> get(String key) {
        LeadInsightCacheEntry entry = entries.get(key);
        if (entry == null) {
            return Optional.empty();
        }

        OffsetDateTime expiresAt = entry.cachedAt().plus(TTL);
        if (!expiresAt.isAfter(OffsetDateTime.now(clock))) {
            entries.remove(key, entry);
            return Optional.empty();
        }

        return Optional.of(entry);
    }

    @Override
    public void put(String key, LeadInsightCacheEntry entry) {
        entries.put(key, entry);
        evictOldestIfNeeded();
    }

    private void evictOldestIfNeeded() {
        if (entries.size() <= MAX_ENTRIES) {
            return;
        }

        entries.entrySet().stream()
                .min(Comparator.comparing(value -> value.getValue().cachedAt()))
                .ifPresent(oldest -> entries.remove(oldest.getKey(), oldest.getValue()));
    }
}
