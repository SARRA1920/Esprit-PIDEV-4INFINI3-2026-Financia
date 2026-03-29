package tn.esprit.financia.service;

import tn.esprit.financia.entities.User;

import java.util.List;

public interface IUserService {
    public User addUser(User user);
    public User updateUser(User user);
    public User getUser(Long idUser);
    public void deleteUser (Long idUser);
    public List<User> getAllUsers();
    public List<User> addAllUsers(List<User> users);
}