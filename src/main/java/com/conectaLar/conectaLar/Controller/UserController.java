package com.conectaLar.conectaLar.Controller;

import com.conectaLar.conectaLar.dto.UserCreateDTO;
import com.conectaLar.conectaLar.dto.UserResponseDTO;
import com.conectaLar.conectaLar.entity.User;
import com.conectaLar.conectaLar.service.UserService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

import java.util.List;

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

    @PostMapping("/login")
    public UserResponseDTO login(@RequestBody User user) {
        User usuarioEncontrado = userService.verificarLogin(user);
        // O id fica salvo no localStorage e identifica a cliente ao solicitar um serviço.
        return new UserResponseDTO(usuarioEncontrado.getId(), usuarioEncontrado.getNome(),
                usuarioEncontrado.getEmail(), usuarioEncontrado.getCelular(),
                usuarioEncontrado.getIdentify());
    }

    // Usado pela Home e pela Busca para listar as profissionais cadastradas.
    @GetMapping("/diaristas")
    public List<UserResponseDTO> listarDiaristas() {
        return userService.listarDiaristas().stream().map(this::dadosPublicos).toList();
    }

    // Usado pelo Perfil e pela tela Solicitar Serviço para mostrar o nome da profissional.
    @GetMapping("/diaristas/{id}")
    public UserResponseDTO buscarDiarista(@PathVariable long id) {
        return dadosPublicos(userService.buscarDiarista(id));
    }

    // Só devolve o id, o nome e o tipo: e-mail e celular não são expostos a qualquer visitante.
    private UserResponseDTO dadosPublicos(User diarista) {
        UserResponseDTO resposta = new UserResponseDTO();
        resposta.setId(diarista.getId());
        resposta.setNome(diarista.getNome());
        resposta.setIdentify(diarista.getIdentify());
        return resposta;
    }

}