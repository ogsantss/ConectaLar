package com.conectaLar.conectaLar.enums;

// Tipo de conta. A página inicial de cada tipo fica no front (PAGINA_INICIAL_DO_PERFIL, em app.js).
public enum Identification {
    CLIENT,
    DIARIST;

    public boolean isDiarista(){
        return this == DIARIST;
    }

    public boolean isCliente(){
        return this == CLIENT;
    }
}
