import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationComponent {
  readonly page = input.required<number>();
  readonly size = input.required<number>();
  readonly totalRows = input.required<number>();
  readonly totalPages = input.required<number>();
  readonly pageSizeOptions = input<number[]>([5, 10, 20, 50]);

  readonly pageChange = output<number>();
  readonly sizeChange = output<number>();

  readonly rangeStart = computed(() =>
    this.totalRows() === 0 ? 0 : this.page() * this.size() + 1,
  );

  readonly rangeEnd = computed(() =>
    Math.min((this.page() + 1) * this.size(), this.totalRows()),
  );

  readonly visiblePages = computed<(number | null)[]>(() => {
    const total = this.totalPages();
    if (total <= 7) return Array.from({ length: total }, (_, i) => i);

    const current = this.page();
    const pages: (number | null)[] = [0];

    const left = Math.max(1, current - 1);
    const right = Math.min(total - 2, current + 1);

    if (left > 1) pages.push(null);
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < total - 2) pages.push(null);

    pages.push(total - 1);
    return pages;
  });

  goFirst(): void { this.pageChange.emit(0); }
  goPrev(): void { this.pageChange.emit(this.page() - 1); }
  goNext(): void { this.pageChange.emit(this.page() + 1); }
  goLast(): void { this.pageChange.emit(this.totalPages() - 1); }

  goTo(p: number): void {
    if (p !== this.page()) this.pageChange.emit(p);
  }

  onSizeChange(event: Event): void {
    this.sizeChange.emit(Number((event.target as HTMLSelectElement).value));
  }
}
