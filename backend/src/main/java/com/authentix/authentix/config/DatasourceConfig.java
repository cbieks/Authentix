package com.authentix.authentix.config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.core.env.Environment;
import org.springframework.util.StringUtils;

import javax.sql.DataSource;

@Configuration
public class DatasourceConfig {

    @Bean
    @Primary
    public DataSource dataSource(Environment environment) {
        String configuredUrl = firstNonBlank(
                environment.getProperty("SPRING_DATASOURCE_URL"),
                environment.getProperty("spring.datasource.url"),
                environment.getProperty("MYSQL_URL")
        );
        String jdbcUrl = toJdbcUrl(configuredUrl);
        if (!StringUtils.hasText(jdbcUrl)) {
            throw new IllegalStateException(
                    "Datasource URL is missing. Set SPRING_DATASOURCE_URL or MYSQL_URL in the environment."
            );
        }

        HikariDataSource dataSource = new HikariDataSource();
        dataSource.setJdbcUrl(jdbcUrl);

        String username = firstNonBlank(
                environment.getProperty("SPRING_DATASOURCE_USERNAME"),
                environment.getProperty("spring.datasource.username"),
                environment.getProperty("MYSQLUSER"),
                environment.getProperty("MYSQL_USER")
        );
        String password = firstNonBlank(
                environment.getProperty("SPRING_DATASOURCE_PASSWORD"),
                environment.getProperty("spring.datasource.password"),
                environment.getProperty("MYSQLPASSWORD"),
                environment.getProperty("MYSQL_PASSWORD")
        );

        if (StringUtils.hasText(username)) {
            dataSource.setUsername(username);
        }
        if (StringUtils.hasText(password)) {
            dataSource.setPassword(password);
        }

        return dataSource;
    }

    static String toJdbcUrl(String url) {
        if (!StringUtils.hasText(url)) {
            return url;
        }
        String trimmed = url.trim();
        if (trimmed.startsWith("jdbc:mysql://")) {
            return trimmed;
        }
        if (trimmed.startsWith("mysql://")) {
            return "jdbc:" + trimmed;
        }
        return trimmed;
    }

    private static String firstNonBlank(String... values) {
        for (String value : values) {
            if (StringUtils.hasText(value)) {
                return value.trim();
            }
        }
        return null;
    }
}
