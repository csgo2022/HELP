package com.mutualaid.service.mini;

import com.mutualaid.common.exception.BusinessException;
import com.mutualaid.model.dto.UserProfileUpdateRequest;
import com.mutualaid.model.entity.*;
import com.mutualaid.model.vo.UserProfileVO;
import com.mutualaid.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final VolunteerProfileRepository volunteerProfileRepository;
    private final VolunteerSkillRepository volunteerSkillRepository;
    private final SkillRepository skillRepository;
    private final UserRealnameAuthRepository realnameAuthRepository;
    private final PasswordEncoder passwordEncoder;
    private final ElderlyFamilyRepository elderlyFamilyRepository;
    private final AddressRepository addressRepository;

    public List<Skill> getAllSkills() {
        return skillRepository.findAll();
    }

    public UserProfileVO getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("用户不存在"));

        UserProfileVO vo = new UserProfileVO();
        vo.setId(user.getId());
        vo.setPhone(user.getPhone());
        vo.setName(user.getName());
        vo.setAvatar(user.getAvatar());
        vo.setGender(user.getGender());
        vo.setBirthDate(user.getBirthDate());
        vo.setRole(user.getRole());
        vo.setPoints(user.getPoints());

        if ("VOLUNTEER".equals(user.getRole())) {
            volunteerProfileRepository.findByUserId(userId).ifPresent(profile -> {
                vo.setTotalHours(profile.getTotalHours());
                vo.setRating(profile.getRating());
                vo.setServiceCount(profile.getServiceCount());
                vo.setVerified(profile.getVerified());
                vo.setIsGold(profile.getIsGold());
                vo.setDescription(profile.getDescription());
            });

            List<Long> skillIds = volunteerSkillRepository.findByVolunteerId(userId)
                    .stream().map(VolunteerSkill::getSkillId).toList();
            if (!skillIds.isEmpty()) {
                List<String> skillNames = skillRepository.findAllById(skillIds)
                        .stream().map(Skill::getName).collect(Collectors.toList());
                vo.setTags(skillNames);
            }
        }

        return vo;
    }

    @Transactional
    public void updateProfile(Long userId, UserProfileUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("用户不存在"));

        if (request.getName() != null) user.setName(request.getName());
        if (request.getGender() != null) user.setGender(request.getGender());
        if (request.getBirthDate() != null) user.setBirthDate(request.getBirthDate());
        if (request.getAvatar() != null) user.setAvatar(request.getAvatar());

        userRepository.save(user);
    }

    @Transactional
    public void changePassword(Long userId, String oldPassword, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("用户不存在"));

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new BusinessException("原密码错误");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Transactional
    public void submitRealnameAuth(Long userId, String realName, String idCard) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("用户不存在"));

        if (!"ELDERLY".equals(user.getRole())) {
            throw new BusinessException("仅老人用户可提交实名认证");
        }

        UserRealnameAuth auth = new UserRealnameAuth();
        auth.setUserId(userId);
        auth.setRealName(realName);
        auth.setIdCard(idCard);
        auth.setStatus("PENDING");
        realnameAuthRepository.save(auth);
    }

    @Transactional
    public void updateSkills(Long userId, List<Long> skillIds, String description) {
        volunteerSkillRepository.deleteByVolunteerId(userId);
        for (Long skillId : skillIds) {
            VolunteerSkill vs = new VolunteerSkill();
            vs.setVolunteerId(userId);
            vs.setSkillId(skillId);
            volunteerSkillRepository.save(vs);
        }
        if (description != null) {
            volunteerProfileRepository.findByUserId(userId).ifPresent(profile -> {
                profile.setDescription(description);
                volunteerProfileRepository.save(profile);
            });
        }
    }

    @Transactional
    public void resetPassword(String phone, String newPassword) {
        User user = userRepository.findByPhone(phone)
                .orElseThrow(() -> new BusinessException("该手机号未注册"));
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Transactional
    public void deleteAccount(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("用户不存在"));
        // 清理关联数据
        elderlyFamilyRepository.deleteByUserId(userId);
        addressRepository.deleteByUserId(userId);
        // 软删除
        user.setStatus(2);
        userRepository.save(user);
    }
}
