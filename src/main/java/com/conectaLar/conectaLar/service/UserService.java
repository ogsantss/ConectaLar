package com.conectaLar.conectaLar.service;

import com.conectaLar.conectaLar.Enums.Identification;
import com.conectaLar.conectaLar.dto.UserCreateDTO;
import com.conectaLar.conectaLar.entity.User;
import com.conectaLar.conectaLar.exception.UserNotFound;
import com.conectaLar.conectaLar.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
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

    public User buscarDiarista(long id) {
        return userRepository.findById(id)
                .filter(usuario -> usuario.getIdentify() == Identification.DIARIST)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Diarista não encontrada."));
    }

    public List<User> listarDiaristas() {
        return userRepository.findByIdentifyOrderByNomeAsc(Identification.DIARIST);
    }



}
