import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizCompletedComponent } from './quiz-completed.component';

describe('QuizCompletedComponent', () => {
  let component: QuizCompletedComponent;
  let fixture: ComponentFixture<QuizCompletedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuizCompletedComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuizCompletedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
