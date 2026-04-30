package com.academic.smartlibrary;

import com.academic.smartlibrary.config.AppProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan(basePackageClasses = AppProperties.class)
public class CampusResourceHubBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(CampusResourceHubBackendApplication.class, args);
    }
}
