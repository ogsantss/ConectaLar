package com.conectaLar.conectaLar.dto;

import com.conectaLar.conectaLar.enums.Identification;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;


public class UserCreateDTO {
    @NotBlank
    private String nome;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String celular;

    @NotBlank
    private String senha;

    @NotNull
    private Identification identify;

    public UserCreateDTO() {
    }

    public Identification getIdentify() {
        return identify;
    }

    public void setIdentify(Identification identify) {
        this.identify = identify;
    }

    public String getSenha() {
        return senha;
    }

    public void setSenha(String senha) {
        this.senha = senha;
    }

    public String getCelular() {
        return celular;
    }

    public void setCelular(String celular) {
        this.celular = celular;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

}
