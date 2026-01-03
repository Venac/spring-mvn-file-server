package rs.sf.fileserver;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.nio.file.FileSystems;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@SpringBootApplication
public class SpringFileServerMavenApplication {

    public static final Logger log = LoggerFactory.getLogger(SpringFileServerMavenApplication.class);

    static void main(String[] args) {
        SpringApplication.run(SpringFileServerMavenApplication.class, args);
    }

    @Bean
    public CommandLineRunner commandLineRunner() {
        return args -> {
            log.info("file_system={}", FileSystems.getDefault());
        };
    }

}
