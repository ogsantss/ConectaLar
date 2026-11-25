package com.conectaLar.conectaLar.controller;

import com.conectaLar.conectaLar.dto.AvaliacaoRequestDTO;
import com.conectaLar.conectaLar.dto.AvaliacaoResponseDTO;
import com.conectaLar.conectaLar.service.AvaliacaoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/avaliacoes")
public class AvaliacaoController {

    private final AvaliacaoService avaliacaoService;

    public AvaliacaoController(AvaliacaoService avaliacaoService) {
        this.avaliacaoService = avaliacaoService;
    }

    // Usado pela tela Avaliar, pelo cliente (avalia a diarista) e pela diarista (avalia o cliente).
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AvaliacaoResponseDTO avaliar(@Valid @RequestBody AvaliacaoRequestDTO dados) {
        return avaliacaoService.avaliar(dados);
    }

    // Avaliações recebidas por um usuário, mostradas no perfil da diarista.
    @GetMapping("/usuario/{usuarioId}")
    public List<AvaliacaoResponseDTO> listarRecebidas(@PathVariable long usuarioId) {
        return avaliacaoService.listarRecebidas(usuarioId);
    }

    // Últimas avaliações de diaristas, mostradas na Home.
    @GetMapping("/recentes")
    public List<AvaliacaoResponseDTO> listarRecentes() {
        return avaliacaoService.listarRecentesDeDiaristas();
    }
}
