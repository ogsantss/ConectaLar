package com.conectaLar.conectaLar.dto;

import com.conectaLar.conectaLar.entity.Conversa;

public record ConversaResponseDTO(
        Long id,
        Long clienteId,
        String clienteNome,
        Long diaristaId,
        String diaristaNome
) {
    public static ConversaResponseDTO from(Conversa c) {
        return new ConversaResponseDTO(
                c.getId(),
                c.getCliente().getId(), c.getCliente().getNome(),
                c.getDiarista().getId(), c.getDiarista().getNome());
    }
}
