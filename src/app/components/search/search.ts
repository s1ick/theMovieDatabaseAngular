import { Component, output, signal, viewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './search.html',
})
export class SearchComponent {
  search = output<string>();
  searchTerm = signal('');
  searchInput = viewChild<ElementRef>('searchInput');

  onSearch(): void {
    this.search.emit(this.searchTerm());
  }

  onClear(): void {
    this.searchTerm.set('');
    this.search.emit('');
    this.searchInput()?.nativeElement.focus();
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onSearch();
    }
  }
}
