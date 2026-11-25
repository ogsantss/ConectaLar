package com.conectaLar.conectaLar.dto;

import com.conectaLar.conectaLar.entity.Avaliacao;

import java.time.LocalDateTime;

public record AvaliacaoResponseDTO(
        Long id,
        Long solicitacaoId,
        Long avaliadorId,
        String avaliadorNome,
        Long avaliadoId,
        String avaliadoNome,
        int nota,
        String comentario,
        LocalDateTime criadaEm
) {
    public static AvaliacaoResponseDTO from(Avaliacao a) {
        return new AvaliacaoResponseDTO(
                a.getId(),
                a.getSolicitacao().getId(),
                a.getAvaliador().getId(), a.getAvaliador().getNome(),
                a.getAvaliado().getId(), a.getAvaliado().getNome(),
                a.getNota(),
                a.getComentario(),
                a.getCriadaEm());
    }
}
