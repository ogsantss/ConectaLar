package com.conectaLar.conectaLar.enums;
import java.util.Arrays;

public enum Avatar {

    AVATAR1, AVATAR2, AVATAR3, AVATAR4, AVATAR5, AVATAR6, AVATAR7, AVATAR8;

    public String getCodigo() {
        return name().toLowerCase();
    }

    public static boolean ehValido(String codigo) {
        return Arrays.stream(values()).anyMatch(avatar -> avatar.getCodigo().equals(codigo));
    }
}
