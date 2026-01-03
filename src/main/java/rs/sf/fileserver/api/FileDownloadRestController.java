package rs.sf.fileserver.api;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/download")
public class FileDownloadRestController {

    public static final Logger log = LoggerFactory.getLogger(FileDownloadRestController.class);

    @GetMapping("/parent")
    public ResponseEntity<StreamingResponseBody> downloadFileFromCurrent(@RequestParam("filename") String filename) {
        String absolutePath = getAbsolutePath(filename);
        Path path = Paths.get(absolutePath);
        StreamingResponseBody streamingResponseBody = getStreamingResponseBody(path);
        return buildResponseEntity(filename, path, streamingResponseBody);
    }

    @GetMapping("/absolute")
    public ResponseEntity<StreamingResponseBody> downloadFile(@RequestParam("filename") String filename) {
        Path path = Paths.get(filename);
        StreamingResponseBody streamingResponseBody = getStreamingResponseBody(path);
        return buildResponseEntity(getFilenameFromAbsolutePath(filename), path, streamingResponseBody);
    }

    private StreamingResponseBody getStreamingResponseBody(Path path) {
        return outputStream -> {
            try (InputStream in = Files.newInputStream(path)) {
                in.transferTo(outputStream);
            }
        };
    }

    private String getAbsolutePath(String filename) {
        String userDir = System.getProperty("user.dir");
        String parentDir = userDir.substring(0, userDir.lastIndexOf(File.separator));
        return parentDir + File.separator + filename;
    }

    private ResponseEntity<StreamingResponseBody> buildResponseEntity(String filename, Path path, StreamingResponseBody streamingResponseBody) {
        try {

            ContentDisposition contentDisposition = ContentDisposition
                    .attachment()
                    .filename(filename, StandardCharsets.UTF_8)
                    .build();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentDisposition(contentDisposition);
            return ResponseEntity.ok()
                    .headers(headers)
                    .contentLength(Files.size(path))
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(streamingResponseBody);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    private String getFilenameFromAbsolutePath(String absolutePath) {
        return absolutePath.substring(absolutePath.lastIndexOf(File.separator) + 1);
    }

}

