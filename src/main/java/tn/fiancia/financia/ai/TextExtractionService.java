package tn.fiancia.financia.ai;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Path;

@Service
public class TextExtractionService {


    public String extractText(Path filePath) {
        if (filePath == null) {
            return "";
        }

        File file = filePath.toFile();
        if (!file.exists() || !file.isFile()) {
            return "";
        }

        String fileName = file.getName().toLowerCase();

        try {
            if (fileName.endsWith(".pdf")) {
                return extractFromPdf(file);
            } else if (fileName.endsWith(".docx")) {
                return extractFromDocx(file);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return "";
    }


    private String extractFromPdf(File file) throws IOException {
        StringBuilder text = new StringBuilder();
        try (PDDocument document = PDDocument.load(file)) {
            PDFTextStripper stripper = new PDFTextStripper();
            text.append(stripper.getText(document));
        }
        return text.toString();
    }


    private String extractFromDocx(File file) throws IOException {
        StringBuilder text = new StringBuilder();
        try (FileInputStream fis = new FileInputStream(file);
             XWPFDocument document = new XWPFDocument(fis)) {
            XWPFWordExtractor extractor = new XWPFWordExtractor(document);
            text.append(extractor.getText());
        }
        return text.toString();
    }
}
