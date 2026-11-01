import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  OnDestroy,
  output,
  viewChild,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { InfoModalConfig } from '../modal.models';

@Component({
  selector: 'app-info-modal',
  templateUrl: './info-modal.component.html',
  styleUrl: './info-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InfoModalComponent implements OnDestroy {
  private readonly document = inject(DOCUMENT);

  readonly config = input.required<InfoModalConfig>();
  readonly closed = output<void>();

  private readonly btnAceptar = viewChild.required<ElementRef<HTMLButtonElement>>('btnAceptar');

  constructor() {
    this.document.body.style.overflow = 'hidden';
    afterNextRender(() => {
      this.btnAceptar().nativeElement.focus();
    });
  }

  ngOnDestroy(): void {
    this.document.body.style.overflow = '';
  }

  aceptar(): void {
    this.closed.emit();
  }
}
