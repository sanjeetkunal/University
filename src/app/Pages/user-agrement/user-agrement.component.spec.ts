import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserAgrementComponent } from './user-agrement.component';

describe('UserAgrementComponent', () => {
  let component: UserAgrementComponent;
  let fixture: ComponentFixture<UserAgrementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserAgrementComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserAgrementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
