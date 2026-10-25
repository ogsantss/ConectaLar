package com.conectaLar.conectaLar.entity;


import org.springframework.format.annotation.NumberFormat;

import com.conectaLar.conectaLar.Enums.Identification;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "usuarios")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(nullable = false)
    @NotBlank
    private String nome;

    @Column(nullable = false, unique = true)
    @Email
    private String email;

    public void setIdentify(Identification identify) {
        this.identify = identify;
    }

    @Column(nullable = false, unique = true)
    @NotBlank
    @NumberFormat
    private String celular;

    @Column(nullable = false)
    @NotBlank
    private String senha;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Identification identify;

    public User() {
    }

    public Identification getIdentify() {
        return identify;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getCelular() {
        return celular;
    }

    public void setCelular(String celular) {
        this.celular = celular;
    }

    public String getSenha() {
        return senha;
    }

    public void setSenha(String senha) {
        this.senha = senha;
    }
}