package com.conectaLar.conectaLar.service;

import com.conectaLar.conectaLar.Repository.UserRepository;
import com.conectaLar.conectaLar.dto.UserCreateDTO;
import com.conectaLar.conectaLar.entity.User;
import org.springframework.stereotype.Service;

@Service
public class UserService {


    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }


    public UserCreateDTO save(User usuario) {
        User user = userRepository.save(usuario);
        return new UserCreateDTO(user.getNome(), user.getEmail(), user.getCelular(), user.getSenha());
    }

}
