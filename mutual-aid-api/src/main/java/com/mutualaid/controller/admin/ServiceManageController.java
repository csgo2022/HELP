package com.mutualaid.controller.admin;

import com.mutualaid.common.response.ApiResponse;
import com.mutualaid.model.entity.ServiceType;
import com.mutualaid.model.entity.Skill;
import com.mutualaid.repository.ServiceTypeRepository;
import com.mutualaid.repository.SkillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class ServiceManageController {

    private final ServiceTypeRepository serviceTypeRepository;
    private final SkillRepository skillRepository;

    @GetMapping("/service-types")
    public ApiResponse<List<ServiceType>> getServiceTypes() {
        return ApiResponse.success(serviceTypeRepository.findAll());
    }

    @PostMapping("/service-types")
    public ApiResponse<ServiceType> createServiceType(@RequestBody Map<String, Object> body) {
        ServiceType st = new ServiceType();
        st.setName((String) body.get("name"));
        st.setIcon((String) body.get("icon"));
        st.setSortOrder(body.get("sortOrder") != null ? Integer.parseInt(body.get("sortOrder").toString()) : 0);
        return ApiResponse.success(serviceTypeRepository.save(st));
    }

    @PutMapping("/service-types/{id}")
    public ApiResponse<ServiceType> updateServiceType(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        ServiceType st = serviceTypeRepository.findById(id).orElseThrow();
        if (body.containsKey("name")) st.setName((String) body.get("name"));
        if (body.containsKey("icon")) st.setIcon((String) body.get("icon"));
        if (body.containsKey("sortOrder")) st.setSortOrder(Integer.parseInt(body.get("sortOrder").toString()));
        return ApiResponse.success(serviceTypeRepository.save(st));
    }

    @DeleteMapping("/service-types/{id}")
    public ApiResponse<Void> deleteServiceType(@PathVariable Long id) {
        serviceTypeRepository.deleteById(id);
        return ApiResponse.success();
    }

    @GetMapping("/skills")
    public ApiResponse<List<Skill>> getSkills() {
        return ApiResponse.success(skillRepository.findAll());
    }

    @PostMapping("/skills")
    public ApiResponse<Skill> createSkill(@RequestBody Map<String, String> body) {
        Skill skill = new Skill();
        skill.setName(body.get("name"));
        skill.setIcon(body.get("icon"));
        return ApiResponse.success(skillRepository.save(skill));
    }

    @PutMapping("/skills/{id}")
    public ApiResponse<Skill> updateSkill(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Skill skill = skillRepository.findById(id).orElseThrow();
        if (body.containsKey("name")) skill.setName(body.get("name"));
        if (body.containsKey("icon")) skill.setIcon(body.get("icon"));
        return ApiResponse.success(skillRepository.save(skill));
    }

    @DeleteMapping("/skills/{id}")
    public ApiResponse<Void> deleteSkill(@PathVariable Long id) {
        skillRepository.deleteById(id);
        return ApiResponse.success();
    }
}
