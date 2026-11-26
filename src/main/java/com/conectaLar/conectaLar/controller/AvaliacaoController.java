package com.conectaLar.conectaLar.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.conectaLar.conectaLar.dto.AvaliacaoCreateDTO;
import com.conectaLar.conectaLar.dto.AvaliacaoResponseDTO;
import com.conectaLar.conectaLar.service.AvaliacaoService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/avaliacoes")
public class AvaliacaoController {

    private final AvaliacaoService avaliacaoService;

    public AvaliacaoController(AvaliacaoService avaliacaoService) {
        this.avaliacaoService = avaliacaoService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AvaliacaoResponseDTO criar(@Valid @RequestBody AvaliacaoCreateDTO dados) {
        return avaliacaoService.criar(dados);
    }

    @GetMapping("/recentes")
    public List<AvaliacaoResponseDTO> listarRecentes() {
        return avaliacaoService.listarRecentes();
    }

    @GetMapping("/diarista/{diaristaId}")
    public List<AvaliacaoResponseDTO> listarDaDiarista(@PathVariable long diaristaId) {
        return avaliacaoService.listarDoAvaliado(diaristaId);
    }

    @GetMapping("/autor/{autorId}/solicitacoes")
    public List<Long> solicitacoesAvaliadas(@PathVariable long autorId) {
        return avaliacaoService.solicitacoesAvaliadasPor(autorId);
    }
}
