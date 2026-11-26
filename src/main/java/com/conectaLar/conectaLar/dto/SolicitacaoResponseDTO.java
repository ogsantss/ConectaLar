package com.conectaLar.conectaLar.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

import com.conectaLar.conectaLar.enums.StatusSolicitacao;
import com.conectaLar.conectaLar.enums.TipoServico;
import com.conectaLar.conectaLar.entity.Solicitacao;

public class SolicitacaoResponseDTO {
    private long id;
    private TipoServico tipoServico;
    private String titulo;
    private LocalDate data;
    private LocalTime hora;
    private String endereco;
    private String observacoes;
    private BigDecimal valor;
    private StatusSolicitacao status;
    private String cliente;
    private String diarista;

    public SolicitacaoResponseDTO(Solicitacao solicitacao) {
        this.id = solicitacao.getId();
        this.tipoServico = solicitacao.getTipoServico();
        this.titulo = solicitacao.getTipoServico().getDescricao();
        this.data = solicitacao.getData();
        this.hora = solicitacao.getHora();
        this.endereco = solicitacao.getEndereco();
        this.observacoes = solicitacao.getObservacoes();
        this.valor = solicitacao.getValor();
        this.status = solicitacao.getStatus();
        this.cliente = solicitacao.getCliente().getNome();
        this.diarista = solicitacao.getDiarista().getNome();
    }

    public long getId() {
        return id;
    }

    public TipoServico getTipoServico() {
        return tipoServico;
    }

    public String getTitulo() {
        return titulo;
    }

    public LocalDate getData() {
        return data;
    }

    public LocalTime getHora() {
        return hora;
    }

    public String getEndereco() {
        return endereco;
    }

    public String getObservacoes() {
        return observacoes;
    }

    public BigDecimal getValor() {
        return valor;
    }

    public StatusSolicitacao getStatus() {
        return status;
    }

    public String getCliente() {
        return cliente;
    }

    public String getDiarista() {
        return diarista;
    }
}
