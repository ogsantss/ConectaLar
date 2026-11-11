package com.conectaLar.conectaLar.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.UNAUTHORIZED)
public class UserNotFound extends RuntimeException {
    public UserNotFound(String message){
        super(message);
    }
}
