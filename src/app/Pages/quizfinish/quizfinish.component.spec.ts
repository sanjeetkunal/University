import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizfinishComponent } from './quizfinish.component';

describe('QuizfinishComponent', () => {
  let component: QuizfinishComponent;
  let fixture: ComponentFixture<QuizfinishComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuizfinishComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuizfinishComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
