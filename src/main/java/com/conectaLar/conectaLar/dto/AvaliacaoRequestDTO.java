package com.conectaLar.conectaLar.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

// avaliadorId é o usuário logado. Quem recebe a nota o service descobre pela solicitação.
public record AvaliacaoRequestDTO(
        @NotNull Long solicitacaoId,
        @NotNull Long avaliadorId,
        @NotNull @Min(1) @Max(5) Integer nota,
        @Size(max = 500) String comentario
) {}
