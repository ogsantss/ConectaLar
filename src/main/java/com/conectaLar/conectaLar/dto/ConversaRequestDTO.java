package com.conectaLar.conectaLar.dto;

import jakarta.validation.constraints.NotNull;

public record ConversaRequestDTO(
        @NotNull Long clienteId,
        @NotNull Long diaristaId
) {}