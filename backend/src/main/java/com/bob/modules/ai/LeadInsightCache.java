package com.bob.modules.ai;

import java.util.Optional;

public interface LeadInsightCache {

    Optional<LeadInsightCacheEntry> get(String key);

    void put(String key, LeadInsightCacheEntry entry);
}
