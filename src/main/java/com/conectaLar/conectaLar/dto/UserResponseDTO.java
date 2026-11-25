package com.conectaLar.conectaLar.dto;

import com.conectaLar.conectaLar.enums.Identification;
import com.conectaLar.conectaLar.enums.TipoServico;
import com.conectaLar.conectaLar.enums.Zona;

import java.util.Set;

// O que o back devolve sobre um usuário. Nunca inclui a senha.
// O id é obrigatório: o front salva no localStorage e usa como clienteId e remetenteId.
public class UserResponseDTO {
    private long id;

    private String nome;

    private String email;

    private String celular;

    private Identification identify;

    private Set<Zona> zonas;

    private Set<TipoServico> servicos;

    private String sobre;

    private String avatar;

    // Média das notas recebidas (1 a 5). Fica null enquanto o usuário não tiver avaliações.
    private Double notaMedia;

    private Integer totalAvaliacoes;

    public UserResponseDTO(long id, String nome, String email, String celular, Identification identify) {
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.celular = celular;
        this.identify = identify;
    }

    public UserResponseDTO() {
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public Identification getIdentify() {
        return identify;
    }

    public void setIdentify(Identification identify) {
        this.identify = identify;
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

    public Set<Zona> getZonas() {
        return zonas;
    }

    public void setZonas(Set<Zona> zonas) {
        this.zonas = zonas;
    }

    public Set<TipoServico> getServicos() {
        return servicos;
    }

    public void setServicos(Set<TipoServico> servicos) {
        this.servicos = servicos;
    }

    public String getSobre() {
        return sobre;
    }

    public void setSobre(String sobre) {
        this.sobre = sobre;
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

    public Double getNotaMedia() {
        return notaMedia;
    }

    public void setNotaMedia(Double notaMedia) {
        this.notaMedia = notaMedia;
    }

    public Integer getTotalAvaliacoes() {
        return totalAvaliacoes;
    }

    public void setTotalAvaliacoes(Integer totalAvaliacoes) {
        this.totalAvaliacoes = totalAvaliacoes;
    }

}
