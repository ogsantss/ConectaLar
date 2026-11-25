package com.conectaLar.conectaLar.service;

import com.conectaLar.conectaLar.dto.LoginRequestDTO;
import com.conectaLar.conectaLar.dto.UserCreateDTO;
import com.conectaLar.conectaLar.dto.UserResponseDTO;
import com.conectaLar.conectaLar.entity.User;
import com.conectaLar.conectaLar.enums.Identification;
import com.conectaLar.conectaLar.enums.Zona;
import com.conectaLar.conectaLar.exception.UserNotFound;
import com.conectaLar.conectaLar.repository.UserRepository;
import com.conectaLar.conectaLar.dto.UserUpdateDTO;
import com.conectaLar.conectaLar.enums.Avatar;
import com.conectaLar.conectaLar.enums.TipoServico;
import java.util.Set;

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

    public UserResponseDTO buscarPorId(long id) {
        return userRepository.findById(id)
                .map(this::toPublicDto)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado."));
    }

    // Usado pelo PUT /usuarios/{id}. Segue o mesmo modelo do decidirSolicitacao:
    // primeiro confere quem está pedindo (403), depois se o registro existe (404), depois as regras (400).
    public UserResponseDTO atualizarPerfil(long id, UserUpdateDTO dados) {
        if (dados.usuarioLogadoId() != id) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Você só pode editar o seu próprio perfil.");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado."));

        // O cliente não manda serviços; null vira "nenhum serviço" para as regras abaixo não quebrarem.
        Set<TipoServico> servicos = dados.servicos() == null ? Set.of() : dados.servicos();
        validarZonasEServicos(user.getIdentify(), dados.zonas(), servicos);

        String avatar = textoOuNulo(dados.avatar());
        if (avatar != null && !Avatar.ehValido(avatar)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Avatar inválido.");
        }

        user.setSobre(textoOuNulo(dados.sobre()));
        user.setAvatar(avatar);
        // clear + addAll troca o conteúdo sem trocar o objeto da coleção, que é como o Hibernate prefere.
        user.getZonas().clear();
        user.getZonas().addAll(dados.zonas());
        user.getServicos().clear();
        user.getServicos().addAll(servicos);

        return toResponseDto(userRepository.save(user));
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

    // Cliente: exatamente 1 zona (onde mora) e nenhum serviço. Diarista: 1 ou mais zonas e pelo menos 1 serviço.
    // A regra de "pelo menos 1 zona" para os dois já vem do @NotEmpty no UserUpdateDTO.
    private void validarZonasEServicos(Identification tipo, Set<Zona> zonas, Set<TipoServico> servicos) {
        if (tipo.isCliente()) {
            if (zonas.size() != 1) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cliente deve ter exatamente uma zona.");
            }
            if (!servicos.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cliente não oferece serviços.");
            }
        } else if (servicos.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Diarista deve oferecer pelo menos um serviço.");
        }
    }

    // "  " ou null viram null, para o banco não guardar texto vazio. Qualquer outro texto é salvo sem espaços nas pontas.
    private String textoOuNulo(String texto) {
        if (texto == null || texto.isBlank()) {
            return null;
        }
        return texto.trim();
    }


}
