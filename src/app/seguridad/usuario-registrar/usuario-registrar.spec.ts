import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsuarioRegistrar } from './usuario-registrar';

describe('UsuarioRegistrar', () => {
  let component: UsuarioRegistrar;
  let fixture: ComponentFixture<UsuarioRegistrar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsuarioRegistrar],
    }).compileComponents();

    fixture = TestBed.createComponent(UsuarioRegistrar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
