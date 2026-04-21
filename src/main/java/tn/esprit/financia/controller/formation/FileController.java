package tn.esprit.financia.controller.formation;

import jakarta.servlet.http.HttpServletRequest;
import lombok.AllArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.financia.service.formation.IStorageService;

@RestController
@RequestMapping("/file")
@AllArgsConstructor
public class FileController {
    IStorageService storageService;

    @GetMapping("/course/**")
    public ResponseEntity<Resource> serveFile(HttpServletRequest request) {
        String fullPath = request.getRequestURI()
                .replace("/f/file/course/", "")
                .replace("%20", " ");
        Resource file = storageService.loadAsResource(fullPath);
        if (!file.exists() || !file.isReadable()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" + file.getFilename() + "\"")
                .body(file);
    }
}
