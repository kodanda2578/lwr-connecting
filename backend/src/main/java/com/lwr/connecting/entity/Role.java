package com.lwr.connecting.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "roles")
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(unique = true, nullable = false)
    private String name;

    public Role() {}

    public Role(Integer id, String name) {
        this.id = id;
        this.name = name;
    }

    public static RoleBuilder builder() {
        return new RoleBuilder();
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public static class RoleBuilder {
        private Integer id;
        private String name;

        public RoleBuilder id(Integer id) { this.id = id; return this; }
        public RoleBuilder name(String name) { this.name = name; return this; }

        public Role build() {
            return new Role(id, name);
        }
    }
}
