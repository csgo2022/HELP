package com.mutualaid.service.mini;

import com.mutualaid.model.entity.User;
import com.mutualaid.model.entity.VolunteerProfile;
import com.mutualaid.repository.UserRepository;
import com.mutualaid.repository.VolunteerProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class LeaderboardService {

    private final VolunteerProfileRepository profileRepository;
    private final UserRepository userRepository;

    @Cacheable(value = "leaderboard", key = "#period != null ? #period : 'all'")
    public List<Map<String, Object>> getLeaderboard(String period) {
        List<VolunteerProfile> profiles = profileRepository.findAll();
        profiles.sort((a, b) -> b.getTotalHours().compareTo(a.getTotalHours()));

        List<Map<String, Object>> result = new ArrayList<>();
        int rank = 1;
        for (VolunteerProfile p : profiles.subList(0, Math.min(profiles.size(), 50))) {
            User user = userRepository.findById(p.getUserId()).orElse(null);
            if (user == null) continue;

            Map<String, Object> entry = new HashMap<>();
            entry.put("rank", rank++);
            entry.put("name", user.getName());
            entry.put("score", p.getTotalHours() + "h");
            entry.put("avatar", user.getAvatar());
            entry.put("hours", p.getTotalHours());
            result.add(entry);
        }
        return result;
    }

    @CacheEvict(value = "leaderboard", allEntries = true)
    public void clearCache() {}
}
