package com.mutualaid.service.mini;

import com.mutualaid.common.exception.BusinessException;
import com.mutualaid.model.dto.LoginRequest;
import com.mutualaid.model.dto.RegisterRequest;
import com.mutualaid.model.entity.User;
import com.mutualaid.model.entity.VolunteerProfile;
import com.mutualaid.model.vo.LoginVO;
import com.mutualaid.repository.UserRepository;
import com.mutualaid.repository.VolunteerProfileRepository;
import com.mutualaid.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final VolunteerProfileRepository volunteerProfileRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;

    public LoginVO login(LoginRequest request) {
        User user = userRepository.findByPhone(request.getPhone())
                .orElseThrow(() -> new BusinessException("手机号未注册"));

        if (user.getStatus() == 1) {
            throw new BusinessException("账号已被禁用");
        }

        if (user.getStatus() == 2) {
            throw new BusinessException("账号已注销");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BusinessException("密码错误");
        }

        return buildLoginVO(user);
    }

    @Transactional
    public LoginVO register(RegisterRequest request) {
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new BusinessException("手机号已被注册");
        }

        User user = new User();
        user.setPhone(request.getPhone());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user = userRepository.save(user);

        if ("VOLUNTEER".equals(request.getRole())) {
            VolunteerProfile profile = new VolunteerProfile();
            profile.setUserId(user.getId());
            volunteerProfileRepository.save(profile);
        }

        return buildLoginVO(user);
    }

    public LoginVO refresh(String refreshToken) {
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new BusinessException("刷新令牌已过期");
        }
        Long userId = jwtTokenProvider.getUserIdFromToken(refreshToken);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("用户不存在"));
        return buildLoginVO(user);
    }

    private LoginVO buildLoginVO(User user) {
        String accessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getRole());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId());
        return new LoginVO(accessToken, refreshToken, user.getId(), user.getRole(), user.getName());
    }
}
