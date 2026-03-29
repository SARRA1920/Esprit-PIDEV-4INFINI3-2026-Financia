package tn.esprit.financia.dto;

import lombok.*;
import tn.esprit.financia.entities.Role;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class UserDTO {
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private String phone;
    private String address;
    private Role role;
}
