package com.conectaLar.conectaLar.dto;

import com.conectaLar.conectaLar.enums.Identification;
import com.conectaLar.conectaLar.enums.Zona;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.Set;


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

    @NotEmpty
    private Set<Zona> zonas;

    public UserCreateDTO() {
    }

    public Set<Zona> getZonas() {
        return zonas;
    }

    public void setZonas(Set<Zona> zonas) {
        this.zonas = zonas;
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
