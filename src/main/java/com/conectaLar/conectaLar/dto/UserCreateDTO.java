package com.conectaLar.conectaLar.dto;

import com.conectaLar.conectaLar.Enums.Identification;


public class UserCreateDTO {
    private String nome;

    private String email;

    private String celular;

    private String senha;

    private Identification identify;

    public UserCreateDTO(String nome, String email, String celular, String senha) {
        this.nome = nome;
        this.email = email;
        this.celular = celular;
        this.senha = senha;
    }


    public UserCreateDTO(){}

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
