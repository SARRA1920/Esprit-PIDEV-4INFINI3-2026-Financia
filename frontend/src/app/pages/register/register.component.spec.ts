import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { RegisterComponent } from './register.component';
import { AuthService } from '../../services/auth.service';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;

  beforeEach(async () => {
    const authStub = {
      register: () =>
        of({
          token: 't',
          user: {
            idUser: 1,
            firstName: 'A',
            lastName: 'B',
            email: 'a@b.com',
            phone: '1',
            role: 'CLIENT',
          },
        }),
      faceEnroll: () => of({ message: 'ok' }),
      googleLogin: () => of({ token: 't', user: { idUser: 1 } }),
    };

    await TestBed.configureTestingModule({
      imports: [FormsModule, RouterTestingModule],
      declarations: [RegisterComponent],
      providers: [{ provide: AuthService, useValue: authStub }],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
