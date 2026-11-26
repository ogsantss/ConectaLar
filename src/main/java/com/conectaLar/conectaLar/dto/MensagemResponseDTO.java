package com.conectaLar.conectaLar.dto;

import com.conectaLar.conectaLar.entity.Mensagem;

import java.time.LocalDateTime;

public record MensagemResponseDTO(
        Long id,
        Long conversaId,
        Long remetenteId,
        String remetenteNome,
        String conteudo,
        LocalDateTime enviadaEm,
        boolean lida
) {
    public static MensagemResponseDTO from(Mensagem m) {
        return new MensagemResponseDTO(
                m.getId(),
                m.getConversa().getId(),
                m.getRemetente().getId(), m.getRemetente().getNome(),
                m.getConteudo(),
                m.getEnviadaEm(),
                m.isLida());
    }
}