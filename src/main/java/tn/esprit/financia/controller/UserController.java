package tn.esprit.financia.controller;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import tn.esprit.financia.entities.Role;
import tn.esprit.financia.entities.User;
import tn.esprit.financia.service.IUserService;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    private final IUserService userService;

    public UserController(IUserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<User> addUser(@RequestBody User user) {
        return ResponseEntity.ok(userService.addUser(user));
    }

    // UPDATE (PUT avec ID dans l’URL)
    @PutMapping("/{idUser}")
    public ResponseEntity<User> updateUser(
            @PathVariable Long idUser,
            @RequestBody User user) {

        user.setIdUser(idUser);
        return ResponseEntity.ok(userService.updateUser(user));
    }


    @GetMapping("/{idUser}")
    public ResponseEntity<User> getUser(@PathVariable Long idUser) {
        return ResponseEntity.ok(userService.getUser(idUser));
    }

    @DeleteMapping("/{idUser}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long idUser) {
        userService.deleteUser(idUser);
        return ResponseEntity.noContent().build(); // REST correct
    }

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/search")
    public ResponseEntity<Page<User>> searchUsers(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Role role,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "lastName") String sortBy,
            @RequestParam(defaultValue = "asc") String direction
    ) {
        return ResponseEntity.ok(userService.searchUsers(keyword, role, page, size, sortBy, direction));
    }

    @PostMapping("/batch")
    public ResponseEntity<List<User>> addAllUsers(@RequestBody List<User> users) {
        return ResponseEntity.ok(userService.addAllUsers(users));
    }
}
