package com.conectaLar.conectaLar.exception;

public class UserNotFound extends RuntimeException {
    public UserNotFound(String message){
        super(message);
    }
}
