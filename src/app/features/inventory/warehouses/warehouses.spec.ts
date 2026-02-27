import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Warehouses } from './warehouses';
import { By } from '@angular/platform-browser';

describe('Warehouses', () => {
  let component: Warehouses;
  let fixture: ComponentFixture<Warehouses>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Warehouses],
    }).compileComponents();

    fixture = TestBed.createComponent(Warehouses);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Initial change detection
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the header with a title and add button', () => {
    const headerEl = fixture.debugElement.query(By.css('.warehouses-header'));
    expect(headerEl).toBeTruthy();

    const titleEl = headerEl.query(By.css('h1'));
    expect(titleEl.nativeElement.textContent).toBe('Warehouses');

    const addButtonEl = headerEl.query(By.css('.btn-primary'));
    expect(addButtonEl.nativeElement.textContent).toBe('Add Warehouse');
  });

  it('should render a table with warehouse data', () => {
    const rows = fixture.debugElement.queryAll(By.css('table tbody tr'));
    expect(rows.length).toBe(4); // Based on mock data

    const firstRowCells = rows[0].queryAll(By.css('td'));
    expect(firstRowCells[0].nativeElement.textContent.trim()).toBe('Main Distribution Center');
    expect(firstRowCells[1].nativeElement.textContent.trim()).toBe('New York, NY');
  });

  it('should render action buttons for each warehouse', () => {
    const firstRow = fixture.debugElement.query(By.css('table tbody tr'));
    const actionButtons = firstRow.queryAll(By.css('.action-buttons button'));
    expect(actionButtons.length).toBe(2);

    const editButtonIcon = actionButtons[0].query(By.css('ng-icon'));
    expect(editButtonIcon.attributes['name']).toBe('heroPencil');

    const deleteButtonIcon = actionButtons[1].query(By.css('ng-icon'));
    expect(deleteButtonIcon.attributes['name']).toBe('heroTrash');
  });

  it('should display an empty state message when there are no warehouses', () => {
    component['warehouseList'].set([]);
    fixture.detectChanges();

    const emptyStateEl = fixture.debugElement.query(By.css('.empty-state'));
    expect(emptyStateEl).toBeTruthy();
    expect(emptyStateEl.query(By.css('p')).nativeElement.textContent).toBe('No warehouses found.');
  });
});
