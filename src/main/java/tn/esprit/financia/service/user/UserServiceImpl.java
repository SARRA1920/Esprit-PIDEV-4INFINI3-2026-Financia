package tn.esprit.financia.service.user;

import lombok.AllArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import tn.esprit.financia.entities.user.User;
import tn.esprit.financia.repository.user.UserRepository;

import java.util.List;

@Service
@AllArgsConstructor
public class UserServiceImpl implements IUserService {

    private UserRepository userRepository;
    private PasswordEncoder passwordEncoder;

    @Override
    public User addUser(User user) {
        // 🔐 Hash password
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
        existingUser.setMonthlyIncome(user.getMonthlyIncome());

        // 🔐 update password ONLY if provided
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
        if (email == null || email.isBlank()) {
            return null;
        }
        return userRepository.findByEmail(email.trim()).orElse(null);
    }

    @Override
    public User updateFacePhoto(Long userId, byte[] facePhoto) {
        User existingUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        existingUser.setFacePhoto(facePhoto);
        return userRepository.save(existingUser);
    }

    @Override
    public User updatePassword(Long userId, String rawPassword) {
        User existingUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        existingUser.setPassword(passwordEncoder.encode(rawPassword));
        return userRepository.save(existingUser);
    }

    @Override
    public void deleteUser(Long idUser) {
        userRepository.deleteById(idUser);
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
}

