package com.conectaLar.conectaLar.controller;

import java.util.Arrays;
import java.util.List;

import com.conectaLar.conectaLar.dto.SolicitacaoDecisaoRequestDTO;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import com.conectaLar.conectaLar.enums.TipoServico;
import com.conectaLar.conectaLar.dto.SolicitacaoCreateDTO;
import com.conectaLar.conectaLar.dto.SolicitacaoResponseDTO;
import com.conectaLar.conectaLar.dto.TipoServicoDTO;
import com.conectaLar.conectaLar.service.SolicitacaoService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/solicitacoes")
public class SolicitacaoController {

    private final SolicitacaoService solicitacaoService;

    public SolicitacaoController(SolicitacaoService solicitacaoService) {
        this.solicitacaoService = solicitacaoService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SolicitacaoResponseDTO criar(@Valid @RequestBody SolicitacaoCreateDTO dados) {
        return solicitacaoService.criar(dados);
    }

    @GetMapping("/tipos")
    public List<TipoServicoDTO> listarTipos() {
        return Arrays.stream(TipoServico.values()).map(TipoServicoDTO::new).toList();
    }

    @GetMapping("/cliente/{clienteId}")
    public List<SolicitacaoResponseDTO> listarDaCliente(@PathVariable long clienteId) {
        return solicitacaoService.listarDaCliente(clienteId);
    }

    @GetMapping("/diarista/{diaristaId}")
    public List<SolicitacaoResponseDTO> listarDaDiarista(@PathVariable long diaristaId) {
        return solicitacaoService.listarDaDiarista(diaristaId);
    }

    @PatchMapping("/{solicitacaoId}/aceitar")
    public SolicitacaoResponseDTO aceitar(@PathVariable Long solicitacaoId, @Valid @RequestBody SolicitacaoDecisaoRequestDTO dados) {
        return solicitacaoService.aceitar(solicitacaoId, dados.diaristaId());
    }

    @PatchMapping("/{solicitacaoId}/recusar")
    public SolicitacaoResponseDTO recusar(@PathVariable Long solicitacaoId, @Valid @RequestBody SolicitacaoDecisaoRequestDTO dados) {
        return solicitacaoService.recusar(solicitacaoId, dados.diaristaId());
    }
}
