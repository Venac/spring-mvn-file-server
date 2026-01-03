package rs.sf.fileserver.model;

public record FileResponse(
        String path,
        String encodedPath,
        boolean isDir
) {
}
