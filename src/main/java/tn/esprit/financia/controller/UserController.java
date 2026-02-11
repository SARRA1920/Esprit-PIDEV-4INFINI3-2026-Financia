package tn.esprit.financia.controller;

import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.financia.entities.User;
import tn.esprit.financia.service.IUserService;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@AllArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {

    private final IUserService userService;

    // ✅ CREATE
    @PostMapping
    public ResponseEntity<User> addUser(@RequestBody User user) {
        return ResponseEntity.ok(userService.addUser(user));
    }

    // ✅ UPDATE (PUT avec ID dans l’URL)
    @PutMapping("/{idUser}")
    public ResponseEntity<User> updateUser(
            @PathVariable Long idUser,
            @RequestBody User user) {

        user.setIdUser(idUser);
        return ResponseEntity.ok(userService.updateUser(user));
    }


    // ✅ GET by ID
    @GetMapping("/{idUser}")
    public ResponseEntity<User> getUser(@PathVariable Long idUser) {
        return ResponseEntity.ok(userService.getUser(idUser));
    }

    // ✅ DELETE
    @DeleteMapping("/{idUser}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long idUser) {
        userService.deleteUser(idUser);
        return ResponseEntity.noContent().build(); // REST correct
    }

    // ✅ GET ALL
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // ✅ BATCH CREATE
    @PostMapping("/batch")
    public ResponseEntity<List<User>> addAllUsers(@RequestBody List<User> users) {
        return ResponseEntity.ok(userService.addAllUsers(users));
    }
}
