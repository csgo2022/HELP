package com.mutualaid.repository;

import com.mutualaid.model.entity.ServicePhoto;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ServicePhotoRepository extends JpaRepository<ServicePhoto, Long> {
    List<ServicePhoto> findByTaskId(Long taskId);
}
