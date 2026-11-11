package com.conectaLar.conectaLar.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.conectaLar.conectaLar.Enums.Identification;
import com.conectaLar.conectaLar.Enums.StatusSolicitacao;
import com.conectaLar.conectaLar.dto.SolicitacaoCreateDTO;
import com.conectaLar.conectaLar.dto.SolicitacaoResponseDTO;
import com.conectaLar.conectaLar.entity.Solicitacao;
import com.conectaLar.conectaLar.entity.User;
import com.conectaLar.conectaLar.repository.SolicitacaoRepository;
import com.conectaLar.conectaLar.repository.UserRepository;

@Service
public class SolicitacaoService {

    private static final List<StatusSolicitacao> STATUS_QUE_OCUPAM_HORARIO =
            List.of(StatusSolicitacao.PENDENTE, StatusSolicitacao.ACEITA);

    private final SolicitacaoRepository solicitacaoRepository;
    private final UserRepository userRepository;

    public SolicitacaoService(SolicitacaoRepository solicitacaoRepository, UserRepository userRepository) {
        this.solicitacaoRepository = solicitacaoRepository;
        this.userRepository = userRepository;
    }

    public SolicitacaoResponseDTO criar(SolicitacaoCreateDTO dados) {
        User cliente = buscarUsuario(dados.getClienteId(), Identification.CLIENT, "Cliente não encontrada.");
        User diarista = buscarUsuario(dados.getDiaristaId(), Identification.DIARIST, "Diarista não encontrada.");

        // Pedidos recusados ou concluídos não ocupam o horário, só os que ainda estão reservados.
        boolean horarioOcupado = solicitacaoRepository.existsByDiaristaIdAndDataAndHoraAndStatusIn(
                diarista.getId(), dados.getData(), dados.getHora(), STATUS_QUE_OCUPAM_HORARIO);
        if (horarioOcupado) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "A diarista já tem um serviço marcado nesse dia e horário.");
        }

        Solicitacao solicitacao = new Solicitacao();
        solicitacao.setCliente(cliente);
        solicitacao.setDiarista(diarista);
        solicitacao.setTipoServico(dados.getTipoServico());
        // O valor sai do enum, nunca do que o navegador mandou.
        solicitacao.setValor(dados.getTipoServico().getValor());
        solicitacao.setData(dados.getData());
        solicitacao.setHora(dados.getHora());
        solicitacao.setEndereco(dados.getEndereco().trim());
        solicitacao.setObservacoes(dados.getObservacoes());

        return new SolicitacaoResponseDTO(solicitacaoRepository.save(solicitacao));
    }

    public List<SolicitacaoResponseDTO> listarDaCliente(long clienteId) {
        return solicitacaoRepository.findByClienteIdOrderByDataDescHoraDesc(clienteId)
                .stream().map(SolicitacaoResponseDTO::new).toList();
    }

    public List<SolicitacaoResponseDTO> listarDaDiarista(long diaristaId) {
        return solicitacaoRepository.findByDiaristaIdOrderByDataAscHoraAsc(diaristaId)
                .stream().map(SolicitacaoResponseDTO::new).toList();
    }

    // Garante que o id existe e é do tipo certo (ex: não dá para "contratar" outra cliente).
    private User buscarUsuario(long id, Identification tipoEsperado, String mensagemDeErro) {
        return userRepository.findById(id)
                .filter(usuario -> usuario.getIdentify() == tipoEsperado)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, mensagemDeErro));
    }
}
