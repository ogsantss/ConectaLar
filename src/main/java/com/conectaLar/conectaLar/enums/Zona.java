package com.conectaLar.conectaLar.enums;

// Região da cidade onde o cliente mora ou onde a diarista atende.
public enum Zona {
    NORTE("Zona Norte"),
    SUL("Zona Sul"),
    LESTE("Zona Leste"),
    OESTE("Zona Oeste");

    private final String descricao;

    Zona(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}
