package rs.sf.fileserver.model;

public record FileResponse(
        String path,
        boolean isDir
) {
}
