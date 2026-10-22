package com.conectaLar.conectaLar.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.conectaLar.conectaLar.Entity.User;

public interface UserRepository extends JpaRepository<User, Long> {
    
}
