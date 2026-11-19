package com.conectaLar.conectaLar.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

// Só o que o login precisa: o cadastro (UserCreateDTO) exige nome, celular e tipo.
public record LoginRequestDTO(
        @NotBlank @Email String email,
        @NotBlank String senha
) {}
