package com.conectaLar.conectaLar.dto;

import com.conectaLar.conectaLar.enums.TipoServico;
import com.conectaLar.conectaLar.enums.Zona;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.Set;

public record UserUpdateDTO(
        @NotNull Long usuarioLogadoId,
        @Size(max = 500, message = "O texto Sobre pode ter no máximo 500 caracteres.") String sobre,
        String avatar,
        @NotEmpty(message = "Escolha pelo menos uma zona.") Set<Zona> zonas,
        Set<TipoServico> servicos) {
}