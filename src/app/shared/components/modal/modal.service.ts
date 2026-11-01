import {
  ApplicationRef,
  createComponent,
  EnvironmentInjector,
  inject,
  Injectable,
} from '@angular/core';
import { outputToObservable } from '@angular/core/rxjs-interop';
import { take } from 'rxjs';
import { InfoModalComponent } from './info-modal/info-modal.component';
import { InfoModalConfig } from './modal.models';

@Injectable({ providedIn: 'root' })
export class ModalService {
  private readonly appRef = inject(ApplicationRef);
  private readonly environmentInjector = inject(EnvironmentInjector);

  openInfo(config: InfoModalConfig): Promise<void> {
    return new Promise<void>((resolve) => {
      const ref = createComponent(InfoModalComponent, {
        environmentInjector: this.environmentInjector,
      });

      ref.setInput('config', config);

      outputToObservable(ref.instance.closed)
        .pipe(take(1))
        .subscribe(() => {
          this.appRef.detachView(ref.hostView);
          ref.destroy();
          resolve();
        });

      this.appRef.attachView(ref.hostView);
      document.body.appendChild(ref.location.nativeElement as HTMLElement);
    });
  }
}
