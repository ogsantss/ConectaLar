package com.conectaLar.conectaLar.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import com.conectaLar.conectaLar.Enums.TipoServico;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class SolicitacaoCreateDTO {
    @NotNull
    private Long clienteId;

    @NotNull
    private Long diaristaId;

    @NotNull
    private TipoServico tipoServico;

    @NotNull
    @FutureOrPresent
    private LocalDate data;

    @NotNull
    private LocalTime hora;

    @NotBlank
    @Size(max = 255)
    private String endereco;

    @Size(max = 500)
    private String observacoes;

    public SolicitacaoCreateDTO() {
    }

    public Long getClienteId() {
        return clienteId;
    }

    public void setClienteId(Long clienteId) {
        this.clienteId = clienteId;
    }

    public Long getDiaristaId() {
        return diaristaId;
    }

    public void setDiaristaId(Long diaristaId) {
        this.diaristaId = diaristaId;
    }

    public TipoServico getTipoServico() {
        return tipoServico;
    }

    public void setTipoServico(TipoServico tipoServico) {
        this.tipoServico = tipoServico;
    }

    public LocalDate getData() {
        return data;
    }

    public void setData(LocalDate data) {
        this.data = data;
    }

    public LocalTime getHora() {
        return hora;
    }

    public void setHora(LocalTime hora) {
        this.hora = hora;
    }

    public String getEndereco() {
        return endereco;
    }

    public void setEndereco(String endereco) {
        this.endereco = endereco;
    }

    public String getObservacoes() {
        return observacoes;
    }

    public void setObservacoes(String observacoes) {
        this.observacoes = observacoes;
    }
}
