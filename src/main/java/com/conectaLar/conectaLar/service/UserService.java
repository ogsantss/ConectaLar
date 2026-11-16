package com.conectaLar.conectaLar.service;

import com.conectaLar.conectaLar.dto.LoginRequestDTO;
import com.conectaLar.conectaLar.dto.UserCreateDTO;
import com.conectaLar.conectaLar.dto.UserResponseDTO;
import com.conectaLar.conectaLar.entity.User;
import com.conectaLar.conectaLar.enums.Identification;
import com.conectaLar.conectaLar.exception.UserNotFound;
import com.conectaLar.conectaLar.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserResponseDTO register(UserCreateDTO userCreateDTO) {
        User savedUser = userRepository.save(toEntity(userCreateDTO));
        return toResponseDto(savedUser);
    }

    public UserResponseDTO authenticate(LoginRequestDTO loginRequestDTO) {
        return userRepository.findByEmailAndSenha(loginRequestDTO.email().toLowerCase(), loginRequestDTO.senha())
                .map(this::toResponseDto)
                .orElseThrow(() -> new UserNotFound("Usuário não encontrado."));
    }

    public List<UserResponseDTO> listDiarists() {
        return userRepository.findByIdentifyOrderByNomeAsc(Identification.DIARIST).stream()
                .map(this::toPublicDto)
                .toList();
    }

    public UserResponseDTO findDiaristById(long id) {
        return userRepository.findById(id)
                .filter(user -> user.getIdentify() == Identification.DIARIST)
                .map(this::toPublicDto)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Diarista não encontrada."));
    }

    // O e-mail é salvo em minúsculas para o login não depender de como a pessoa digitou.
    private User toEntity(UserCreateDTO userCreateDTO) {
        return new User(userCreateDTO.getNome(), userCreateDTO.getEmail().toLowerCase(), userCreateDTO.getCelular(),
                userCreateDTO.getSenha(), userCreateDTO.getIdentify());
    }

    // Dados completos: só para o próprio usuário (resposta do cadastro e do login).
    private UserResponseDTO toResponseDto(User user) {
        return new UserResponseDTO(user.getId(), user.getNome(), user.getEmail(), user.getCelular(), user.getIdentify());
    }

    // Dados públicos: e-mail e celular não são expostos a qualquer visitante.
    private UserResponseDTO toPublicDto(User user) {
        UserResponseDTO response = new UserResponseDTO();
        response.setId(user.getId());
        response.setNome(user.getNome());
        response.setIdentify(user.getIdentify());
        return response;
    }

}
