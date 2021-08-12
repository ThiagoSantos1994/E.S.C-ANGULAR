import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LancamentosFinanceirosFormComponent } from './lancamentos-financeiros-form.component';

describe('LancamentosFinanceirosFormComponent', () => {
  let component: LancamentosFinanceirosFormComponent;
  let fixture: ComponentFixture<LancamentosFinanceirosFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LancamentosFinanceirosFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LancamentosFinanceirosFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
