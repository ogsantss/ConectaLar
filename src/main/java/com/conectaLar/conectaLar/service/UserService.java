package com.conectaLar.conectaLar.service;

import com.conectaLar.conectaLar.exception.UserNotFound;
import com.conectaLar.conectaLar.repository.UserRepository;
import com.conectaLar.conectaLar.dto.UserCreateDTO;
import com.conectaLar.conectaLar.entity.User;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {


    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }


    public UserCreateDTO save(User usuario) {
        String email = usuario.getEmail();
        usuario.setEmail(email.toLowerCase());
        User user = userRepository.save(usuario);
        return new UserCreateDTO(user.getNome(), user.getEmail(), user.getCelular());
    }
    public User verificarLogin(User user){
        String email = user.getEmail();
        String senha = user.getSenha();
        Optional<User> optionalUser = userRepository.findByEmailAndSenha(email.toLowerCase(),senha);
        if(optionalUser.isEmpty()){
        throw new UserNotFound("Usuário não encontrado.");
        }
        return optionalUser.get();
        }



}
