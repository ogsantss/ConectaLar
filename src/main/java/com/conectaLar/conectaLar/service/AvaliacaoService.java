package com.conectaLar.conectaLar.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.conectaLar.conectaLar.dto.AvaliacaoCreateDTO;
import com.conectaLar.conectaLar.dto.AvaliacaoResponseDTO;
import com.conectaLar.conectaLar.entity.Avaliacao;
import com.conectaLar.conectaLar.entity.Solicitacao;
import com.conectaLar.conectaLar.entity.User;
import com.conectaLar.conectaLar.enums.StatusSolicitacao;
import com.conectaLar.conectaLar.repository.AvaliacaoRepository;
import com.conectaLar.conectaLar.repository.SolicitacaoRepository;

@Service
public class AvaliacaoService {

    private final AvaliacaoRepository avaliacaoRepository;
    private final SolicitacaoRepository solicitacaoRepository;

    public AvaliacaoService(AvaliacaoRepository avaliacaoRepository, SolicitacaoRepository solicitacaoRepository) {
        this.avaliacaoRepository = avaliacaoRepository;
        this.solicitacaoRepository = solicitacaoRepository;
    }

    public AvaliacaoResponseDTO criar(AvaliacaoCreateDTO dados) {
        Solicitacao solicitacao = solicitacaoRepository.findById(dados.getSolicitacaoId()).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Essa solicitação não existe."));

        long autorId = dados.getAutorId();
        User autor;
        User avaliado;
        if (solicitacao.getCliente().getId() == autorId) {
            autor = solicitacao.getCliente();
            avaliado = solicitacao.getDiarista();
        } else if (solicitacao.getDiarista().getId() == autorId) {
            autor = solicitacao.getDiarista();
            avaliado = solicitacao.getCliente();
        } else {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Você não participou dessa solicitação.");
        }

        if (solicitacao.getStatus() != StatusSolicitacao.CONCLUIDA) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Só é possível avaliar um serviço concluído. Status Solicitação: " + solicitacao.getStatus());
        }

        if (avaliacaoRepository.existsBySolicitacaoIdAndAutorId(solicitacao.getId(), autorId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Você já avaliou esse serviço.");
        }

        Avaliacao avaliacao = new Avaliacao();
        avaliacao.setSolicitacao(solicitacao);
        avaliacao.setAutor(autor);
        avaliacao.setAvaliado(avaliado);
        avaliacao.setNota(dados.getNota());
        avaliacao.setComentario(textoOuNulo(dados.getComentario()));

        return new AvaliacaoResponseDTO(avaliacaoRepository.save(avaliacao));
    }

    public List<AvaliacaoResponseDTO> listarDoAvaliado(long avaliadoId) {
        return avaliacaoRepository.findByAvaliadoIdOrderByCriadaEmDesc(avaliadoId)
                .stream().map(AvaliacaoResponseDTO::new).toList();
    }

    public List<AvaliacaoResponseDTO> listarRecentes() {
        return avaliacaoRepository.findTop3ByComentarioIsNotNullOrderByCriadaEmDesc()
                .stream().map(AvaliacaoResponseDTO::new).toList();
    }

    public List<Long> solicitacoesAvaliadasPor(long autorId) {
        return avaliacaoRepository.findByAutorId(autorId)
                .stream().map(avaliacao -> avaliacao.getSolicitacao().getId()).toList();
    }

    private String textoOuNulo(String texto) {
        if (texto == null || texto.isBlank()) {
            return null;
        }
        return texto.trim();
    }
}
