package tn.esprit.financia.service;

import org.springframework.data.domain.Page;
import tn.esprit.financia.entities.Role;
import tn.esprit.financia.entities.User;

import java.util.List;

public interface IUserService {
    User addUser(User user);
    User updateUser(User user);
    User getUser(Long idUser);
    User getUserByEmail(String email);
    void deleteUser(Long idUser);
    void updatePassword(Long userId, String newPassword);
    void updateFacePhoto(Long userId, byte[] facePhoto);
    List<User> getAllUsers();
    List<User> addAllUsers(List<User> users);
    Page<User> searchUsers(String keyword, Role role, int page, int size, String sortBy, String direction);
}