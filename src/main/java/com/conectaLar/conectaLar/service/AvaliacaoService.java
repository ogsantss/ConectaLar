package com.conectaLar.conectaLar.service;

import com.conectaLar.conectaLar.dto.AvaliacaoRequestDTO;
import com.conectaLar.conectaLar.dto.AvaliacaoResponseDTO;
import com.conectaLar.conectaLar.entity.Avaliacao;
import com.conectaLar.conectaLar.entity.Solicitacao;
import com.conectaLar.conectaLar.entity.User;
import com.conectaLar.conectaLar.enums.Identification;
import com.conectaLar.conectaLar.enums.StatusSolicitacao;
import com.conectaLar.conectaLar.repository.AvaliacaoRepository;
import com.conectaLar.conectaLar.repository.SolicitacaoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class AvaliacaoService {

    private final AvaliacaoRepository avaliacaoRepository;
    private final SolicitacaoRepository solicitacaoRepository;

    public AvaliacaoService(AvaliacaoRepository avaliacaoRepository, SolicitacaoRepository solicitacaoRepository) {
        this.avaliacaoRepository = avaliacaoRepository;
        this.solicitacaoRepository = solicitacaoRepository;
    }

    // Mesmo modelo do decidirSolicitacao: a solicitação existe (404), quem pede participou dela (403),
    // depois as regras de negócio (409): só serviço CONCLUIDA e só uma avaliação por pessoa.
    public AvaliacaoResponseDTO avaliar(AvaliacaoRequestDTO dados) {
        Solicitacao solicitacao = solicitacaoRepository.findById(dados.solicitacaoId()).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Essa solicitação não existe."));

        // Quem avalia é o cliente ou a diarista da solicitação; a nota vai para a outra pessoa.
        User avaliador;
        User avaliado;
        if (solicitacao.getCliente().getId() == dados.avaliadorId()) {
            avaliador = solicitacao.getCliente();
            avaliado = solicitacao.getDiarista();
        } else if (solicitacao.getDiarista().getId() == dados.avaliadorId()) {
            avaliador = solicitacao.getDiarista();
            avaliado = solicitacao.getCliente();
        } else {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Você não participou dessa solicitação.");
        }

        if (solicitacao.getStatus() != StatusSolicitacao.CONCLUIDA) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Só é possível avaliar um serviço concluído. Status Solicitação: " + solicitacao.getStatus());
        }
        if (avaliacaoRepository.existsBySolicitacaoIdAndAvaliadorId(solicitacao.getId(), avaliador.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Você já avaliou esse serviço.");
        }

        Avaliacao avaliacao = new Avaliacao();
        avaliacao.setSolicitacao(solicitacao);
        avaliacao.setAvaliador(avaliador);
        avaliacao.setAvaliado(avaliado);
        avaliacao.setNota(dados.nota());
        avaliacao.setComentario(textoOuNulo(dados.comentario()));

        return AvaliacaoResponseDTO.from(avaliacaoRepository.save(avaliacao));
    }

    // Avaliações que um usuário recebeu (perfil da diarista).
    public List<AvaliacaoResponseDTO> listarRecebidas(long usuarioId) {
        return avaliacaoRepository.findByAvaliadoIdOrderByCriadaEmDesc(usuarioId)
                .stream().map(AvaliacaoResponseDTO::from).toList();
    }

    // Últimas avaliações feitas para diaristas, mostradas na Home.
    public List<AvaliacaoResponseDTO> listarRecentesDeDiaristas() {
        return avaliacaoRepository.findTop3ByAvaliadoIdentifyOrderByCriadaEmDesc(Identification.DIARIST)
                .stream().map(AvaliacaoResponseDTO::from).toList();
    }

    // Comentário em branco vira null, para o banco não guardar texto vazio.
    private String textoOuNulo(String texto) {
        if (texto == null || texto.isBlank()) {
            return null;
        }
        return texto.trim();
    }
}
