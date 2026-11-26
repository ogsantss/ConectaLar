package com.conectaLar.conectaLar.dto;

import java.time.LocalDateTime;

import com.conectaLar.conectaLar.entity.Avaliacao;

public class AvaliacaoResponseDTO {
    private long id;
    private int nota;
    private String comentario;
    private String autorNome;
    private LocalDateTime criadaEm;

    public AvaliacaoResponseDTO(Avaliacao avaliacao) {
        this.id = avaliacao.getId();
        this.nota = avaliacao.getNota();
        this.comentario = avaliacao.getComentario();
        this.autorNome = avaliacao.getAutor().getNome();
        this.criadaEm = avaliacao.getCriadaEm();
    }

    public long getId() {
        return id;
    }

    public int getNota() {
        return nota;
    }

    public String getComentario() {
        return comentario;
    }

    public String getAutorNome() {
        return autorNome;
    }

    public LocalDateTime getCriadaEm() {
        return criadaEm;
    }
}
