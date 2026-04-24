package tn.esprit.financia.service.user;

import tn.esprit.financia.entities.user.User;

import java.util.List;

public interface IUserService {
    User addUser(User user);

    User updateUser(User user);

    /** Met à jour uniquement la description d’objectif / projet (recommandations LMS). */
    User updateProjectGoal(Long idUser, String projectGoal);

    User getUser(Long idUser);

    User getUserByEmail(String email);

    User updateFacePhoto(Long userId, byte[] facePhoto);

    User updatePassword(Long userId, String rawPassword);

    void deleteUser(Long idUser);

    List<User> getAllUsers();

    List<User> addAllUsers(List<User> users);
}

