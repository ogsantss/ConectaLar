package com.conectaLar.conectaLar.controller;

import com.conectaLar.conectaLar.dto.LoginRequestDTO;
import com.conectaLar.conectaLar.dto.UserCreateDTO;
import com.conectaLar.conectaLar.dto.UserResponseDTO;
import com.conectaLar.conectaLar.enums.Zona;
import com.conectaLar.conectaLar.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import com.conectaLar.conectaLar.enums.Avatar;
import java.util.Arrays;
import com.conectaLar.conectaLar.dto.UserUpdateDTO;

import java.util.List;

@RestController
@RequestMapping("/usuarios")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponseDTO register(@Valid @RequestBody UserCreateDTO userCreateDTO) {
        return userService.register(userCreateDTO);
    }

    // O id devolvido fica salvo no localStorage e identifica o usuário nas outras telas.
    @PostMapping("/login")
    public UserResponseDTO login(@Valid @RequestBody LoginRequestDTO loginRequestDTO) {
        return userService.authenticate(loginRequestDTO);
    }

    // Usado pela Home e pela Busca para listar as profissionais cadastradas.
    @GetMapping("/diaristas")
    public List<UserResponseDTO> listDiarists(@RequestParam(required = false) Zona zona) {
        return userService.listDiarists(zona);
    }

    // Usado pelo Perfil e pela tela Solicitar Serviço para mostrar o nome da profissional.
    @GetMapping("/diaristas/{id}")
    public UserResponseDTO findDiaristById(@PathVariable long id) {
        return userService.findDiaristById(id);
    }

    @GetMapping("/avatares")
    public List<String> listarAvatares() {
        return Arrays.stream(Avatar.values()).map(Avatar::getCodigo).toList();
    }

    // Dados públicos de qualquer usuário (cliente ou diarista), usados para carregar a tela Editar perfil.
    @GetMapping("/{id}")
    public UserResponseDTO buscarPorId(@PathVariable long id) {
        return userService.buscarPorId(id);
    }

    @PutMapping("/{id}")
    public UserResponseDTO atualizarPerfil(@PathVariable long id, @Valid @RequestBody UserUpdateDTO dados) {
        return userService.atualizarPerfil(id, dados);
    }
}
