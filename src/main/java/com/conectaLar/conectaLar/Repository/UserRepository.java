package com.conectaLar.conectaLar.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.conectaLar.conectaLar.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {
    
}
