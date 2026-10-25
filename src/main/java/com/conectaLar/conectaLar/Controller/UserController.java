package com.conectaLar.conectaLar.controller;

import com.conectaLar.conectaLar.dto.UserCreateDTO;
import com.conectaLar.conectaLar.entity.User;
import com.conectaLar.conectaLar.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import jakarta.validation.Valid;

@RestController
@RequestMapping("/usuarios")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<UserCreateDTO> cadastrar(@Valid @RequestBody User usuario) {
        UserCreateDTO usuarioSalvo = userService.save(usuario);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(usuarioSalvo);
    }

}