package com.conectaLar.conectaLar.service;

import com.conectaLar.conectaLar.Enums.Identification;
import com.conectaLar.conectaLar.dto.ConversaRequestDTO;
import com.conectaLar.conectaLar.dto.ConversaResponseDTO;
import com.conectaLar.conectaLar.dto.MensagemRequestDTO;
import com.conectaLar.conectaLar.dto.MensagemResponseDTO;
import com.conectaLar.conectaLar.entity.Conversa;
import com.conectaLar.conectaLar.entity.Mensagem;
import com.conectaLar.conectaLar.entity.User;
import com.conectaLar.conectaLar.repository.ConversaRepository;
import com.conectaLar.conectaLar.repository.MensagemRepository;
import com.conectaLar.conectaLar.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ChatService {

    private final ConversaRepository conversaRepository;
    private final MensagemRepository mensagemRepository;
    private final UserRepository userRepository;

    public ChatService(ConversaRepository conversaRepository,
                       MensagemRepository mensagemRepository,
                       UserRepository userRepository) {
        this.conversaRepository = conversaRepository;
        this.mensagemRepository = mensagemRepository;
        this.userRepository = userRepository;
    }

    private User buscarUsuario(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Usuário " + id + " não encontrado"));
    }

    private Conversa buscarConversa(Long id) {
        return conversaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Conversa " + id + " não encontrada"));
    }

    public ConversaResponseDTO abrirConversa(ConversaRequestDTO dto) {
        User cliente = buscarUsuario(dto.clienteId());
        User diarista = buscarUsuario(dto.diaristaId());

        if (cliente.getIdentify() != Identification.CLIENT) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Esse usuário não é cliente");
        }
        if (diarista.getIdentify() != Identification.DIARIST) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Esse usuário não é diarista");
        }

        Optional<Conversa> existente =
                conversaRepository.findByClienteIdAndDiaristaId(cliente.getId(), diarista.getId());

        Conversa conversa;
        if (existente.isPresent()) {
            conversa = existente.get();
        } else {
            conversa = new Conversa();
            conversa.setCliente(cliente);
            conversa.setDiarista(diarista);
            conversa = conversaRepository.save(conversa);
        }

        return ConversaResponseDTO.from(conversa);
    }

    public List<ConversaResponseDTO> listarConversas(Long usuarioId) {
        List<Conversa> conversas =
                conversaRepository.findByClienteIdOrDiaristaId(usuarioId, usuarioId);

        List<ConversaResponseDTO> resposta = new ArrayList<>();
        for (Conversa c : conversas) {
            resposta.add(ConversaResponseDTO.from(c));
        }

        return resposta;
    }

    public List<MensagemResponseDTO> listarMensagens(Long conversaId) {
        buscarConversa(conversaId);

        List<Mensagem> mensagens =
                mensagemRepository.findByConversaIdOrderByEnviadaEmAsc(conversaId);

        List<MensagemResponseDTO> resposta = new ArrayList<>();
        for (Mensagem m : mensagens) {
            resposta.add(MensagemResponseDTO.from(m));
        }

        return resposta;
    }

    public MensagemResponseDTO enviarMensagem(Long conversaId, MensagemRequestDTO dto) {
        Conversa conversa = buscarConversa(conversaId);
        User remetente = buscarUsuario(dto.remetenteId());

        boolean ehOCliente = conversa.getCliente().getId() == remetente.getId();
        boolean ehADiarista = conversa.getDiarista().getId() == remetente.getId();

        if (!ehOCliente && !ehADiarista) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Você não participa desta conversa");
        }

        Mensagem mensagem = new Mensagem();
        mensagem.setConversa(conversa);
        mensagem.setRemetente(remetente);
        mensagem.setConteudo(dto.conteudo().trim());

        Mensagem salva = mensagemRepository.save(mensagem);

        return MensagemResponseDTO.from(salva);
    }
}