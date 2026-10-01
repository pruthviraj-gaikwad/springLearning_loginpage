package com.loginapp.backend.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController 
@RequestMapping("/api") 
public class HelloController {

    @GetMapping("/hello")
    public Map<String,String> hello(){
        return Map.of("message","hello from the pruthvi");
    }
    @GetMapping("/hello/{name}")
    public Map<String,String> hello(@PathVariable String name){
        return Map.of("message","hello "+ name);  
    }
}
