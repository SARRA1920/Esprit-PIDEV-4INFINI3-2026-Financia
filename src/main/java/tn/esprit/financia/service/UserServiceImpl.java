package tn.esprit.financia.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;
import tn.esprit.financia.entities.Role;
import tn.esprit.financia.entities.User;
import tn.esprit.financia.repository.UserRepository;

import java.util.List;

@Service
public class UserServiceImpl implements IUserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public User addUser(User user) {
        // Hash password
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    @Override
    public User updateUser(User user) {

        User existingUser = userRepository.findById(user.getIdUser())
                .orElseThrow(() -> new RuntimeException("User not found"));

        existingUser.setFirstName(user.getFirstName());
        existingUser.setLastName(user.getLastName());
        existingUser.setEmail(user.getEmail());
        existingUser.setPhone(user.getPhone());
        existingUser.setAddress(user.getAddress());
        existingUser.setRole(user.getRole());

        // update password only if provided
        if (user.getPassword() != null && !user.getPassword().isEmpty()) {
            existingUser.setPassword(passwordEncoder.encode(user.getPassword()));
        }

        return userRepository.save(existingUser);
    }





    @Override
    public User getUser(Long idUser) {
        return userRepository.findById(idUser).orElse(null);
    }

    @Override
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }

    @Override
    public void deleteUser(Long idUser) {
        userRepository.deleteById(idUser);
    }

    @Override
    @Transactional
    public void updatePassword(Long userId, String newPassword) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.saveAndFlush(user);
    }

    @Override
    @Transactional
    public void updateFacePhoto(Long userId, byte[] facePhoto) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        user.setFacePhoto(facePhoto);
        userRepository.saveAndFlush(user);
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public List<User> addAllUsers(List<User> users) {
        users.forEach(u -> u.setPassword(passwordEncoder.encode(u.getPassword())));
        return userRepository.saveAll(users);
    }

    @Override
    public Page<User> searchUsers(String keyword, Role role, int page, int size, String sortBy, String direction) {
        String orderBy = (sortBy == null || sortBy.isBlank()) ? "lastName" : sortBy;
        Sort sort = "desc".equalsIgnoreCase(direction)
                ? Sort.by(orderBy).descending()
                : Sort.by(orderBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return userRepository.searchUsers(keyword, role, pageable);
    }
}
