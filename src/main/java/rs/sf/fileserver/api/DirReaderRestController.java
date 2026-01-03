package rs.sf.fileserver.api;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import rs.sf.fileserver.model.FileResponse;

import java.io.File;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/dir")
public class DirReaderRestController {

    private static final Logger log = LoggerFactory.getLogger(DirReaderRestController.class);

    @GetMapping("/current")
    public ResponseEntity<?> readCurrentDir()
    {
        Path dir = Paths.get(System.getProperty("user.dir"));
        List<FileResponse> files = getFilePathsFormatted(dir);
        return ResponseEntity.ok().body(files);
    }

    @GetMapping("/parent")
    public ResponseEntity<?> readParentDir()
    {
        String userDir = System.getProperty("user.dir");
        String parentDir = userDir.substring(0, userDir.lastIndexOf(File.separator));
        if (FileSystems.getDefault().toString().toLowerCase().contains("windows") && parentDir.matches("[A-Za-z]:")) {
            parentDir = parentDir + "\\\\";
        }
        Path dir = Paths.get(parentDir);
        List<FileResponse> files = getFilePathsFormatted(dir);
        return ResponseEntity.ok().body(files);
    }

    @GetMapping("/absolute")
    public ResponseEntity<?> readAbsoluteDir(@RequestParam("path") String path)
    {
        Path dir = Paths.get(path);
        List<FileResponse> files = getFilePathsFormatted(dir);
        return ResponseEntity.ok().body(files);
    }

    private String encode(String string) {
        return URLEncoder.encode(string, StandardCharsets.UTF_8);
    }

    private String format(String string) {
        return string + " ===> " + encode(string);
    }

    private List<FileResponse> getFilePathsFormatted(Path dir) {
        List<FileResponse> files = new ArrayList<>();
        try (DirectoryStream<Path> stream = Files.newDirectoryStream(dir)) {
            stream.forEach(path -> {
                FileResponse  fileResponse = new FileResponse(path.toFile().getAbsolutePath(), encode(path.toFile().getAbsolutePath()), path.toFile().isDirectory());
                files.add(fileResponse);
            });
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        return files;
    }
}
