package com.conectaLar.conectaLar.enums;

public enum Identification {
    CLIENT("Cliente", "busca.html"),
    DIARIST("Diarista", "agenda.html");

    private final String rotulo;
    private final String paginaInicial;

    Identification(String rotulo, String paginaInicial) {
        this.rotulo = rotulo;
        this.paginaInicial = paginaInicial;
    }

    public String getRotulo() {
        return rotulo;
    }

    public String getPaginaInicial() {
        return paginaInicial;
    }

    public boolean isDiarista(){
        return this == DIARIST;
    }

    public boolean isCliente(){
        return this == CLIENT;
    }
}