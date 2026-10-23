package com.conectaLar.conectaLar.Controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.conectaLar.conectaLar.Entity.User;
import com.conectaLar.conectaLar.Repository.UserRepository;

import jakarta.validation.Valid;

@RestController 
@RequestMapping ("/usuarios")
public class UserController {
    private final UserRepository userRepository;

    public UserController(UserRepository userRepository){
        this.userRepository = userRepository;
    }

    @PostMapping 
    public ResponseEntity<User> cadastrar(@Valid @RequestBody User usuario){
        User usuarioSalvo = userRepository.save(usuario);

        return ResponseEntity
        .status(HttpStatus.CREATED)
        .body(usuarioSalvo);
    }
}