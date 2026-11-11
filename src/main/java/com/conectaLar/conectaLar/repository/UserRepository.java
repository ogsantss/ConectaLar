package com.conectaLar.conectaLar.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.conectaLar.conectaLar.Enums.Identification;
import com.conectaLar.conectaLar.entity.User;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmailAndSenha(String email, String senha);

    List<User> findByIdentifyOrderByNomeAsc(Identification identify);
}
