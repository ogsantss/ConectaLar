package com.conectaLar.conectaLar.Controller;

import com.conectaLar.conectaLar.dto.ConversaRequestDTO;
import com.conectaLar.conectaLar.dto.ConversaResponseDTO;
import com.conectaLar.conectaLar.dto.MensagemRequestDTO;
import com.conectaLar.conectaLar.dto.MensagemResponseDTO;
import com.conectaLar.conectaLar.service.ChatService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/conversas")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping
    public ConversaResponseDTO abrirConversa(@Valid @RequestBody ConversaRequestDTO dto) {
        return chatService.abrirConversa(dto);
    }

    @GetMapping
    public List<ConversaResponseDTO> listarConversas(@RequestParam Long usuarioId) {
        return chatService.listarConversas(usuarioId);
    }

    @GetMapping("/{conversaId}/mensagens")
    public List<MensagemResponseDTO> listarMensagens(@PathVariable Long conversaId) {
        return chatService.listarMensagens(conversaId);
    }

    @PostMapping("/{conversaId}/mensagens")
    public ResponseEntity<MensagemResponseDTO> enviarMensagem(@PathVariable Long conversaId,
                                                              @Valid @RequestBody MensagemRequestDTO dto) {
        MensagemResponseDTO salva = chatService.enviarMensagem(conversaId, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(salva);
    }
}