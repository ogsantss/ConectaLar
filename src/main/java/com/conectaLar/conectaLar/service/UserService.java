package com.conectaLar.conectaLar.service;

import com.conectaLar.conectaLar.dto.LoginRequestDTO;
import com.conectaLar.conectaLar.dto.UserCreateDTO;
import com.conectaLar.conectaLar.dto.UserResponseDTO;
import com.conectaLar.conectaLar.entity.User;
import com.conectaLar.conectaLar.enums.Identification;
import com.conectaLar.conectaLar.enums.Zona;
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
        if (userCreateDTO.getIdentify() == Identification.CLIENT && userCreateDTO.getZonas().size() != 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cliente não pode ter mais de uma zona.");
        }
        // Email e celular são únicos no banco. Conferir antes de salvar devolve 409 com uma
        // mensagem clara, em vez do 500 genérico que o banco geraria ao recusar a duplicata.
        // O email é comparado em minúsculas porque é assim que ele é salvo (toEntity).
        if (userRepository.existsByEmail(userCreateDTO.getEmail().toLowerCase())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email já cadastrado.");
        }
        if (userRepository.existsByCelular(userCreateDTO.getCelular())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Celular já cadastrado.");
        }
        User savedUser = userRepository.save(toEntity(userCreateDTO));
        return toResponseDto(savedUser);
    }

    public UserResponseDTO authenticate(LoginRequestDTO loginRequestDTO) {
        return userRepository.findByEmailAndSenha(loginRequestDTO.email().toLowerCase(), loginRequestDTO.senha())
                .map(this::toResponseDto)
                .orElseThrow(() -> new UserNotFound("Usuário não encontrado."));
    }

    public List<UserResponseDTO> listDiarists(Zona zona) {
        List<User> diaristas;
        if (zona == null) {
            diaristas = userRepository.findByIdentifyOrderByNomeAsc(Identification.DIARIST);
        } else {
            diaristas = userRepository.findByIdentifyAndZonasContainingOrderByNomeAsc(Identification.DIARIST, zona);
        }
        return diaristas.stream()
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
        User user = new User(userCreateDTO.getNome(), userCreateDTO.getEmail().toLowerCase(), userCreateDTO.getCelular(),
                userCreateDTO.getSenha(), userCreateDTO.getIdentify());
        user.setZonas(userCreateDTO.getZonas());
        return user;
    }

    // Dados completos: só para o próprio usuário (resposta do cadastro e do login).
    private UserResponseDTO toResponseDto(User user) {
        UserResponseDTO response = new UserResponseDTO(user.getId(), user.getNome(), user.getEmail(),
                user.getCelular(), user.getIdentify());
        preencherPerfil(response, user);
        return response;
    }

    // Dados públicos: e-mail e celular não são expostos a qualquer visitante.
    private UserResponseDTO toPublicDto(User user) {
        UserResponseDTO response = new UserResponseDTO();
        response.setId(user.getId());
        response.setNome(user.getNome());
        response.setIdentify(user.getIdentify());
        preencherPerfil(response, user);
        return response;
    }

    // Campos de perfil comuns às duas respostas. notaMedia e totalAvaliacoes ficam para a frente de avaliações.
    private void preencherPerfil(UserResponseDTO response, User user) {
        response.setZonas(user.getZonas());
        response.setServicos(user.getServicos());
        response.setSobre(user.getSobre());
        response.setAvatar(user.getAvatar());
    }

}
