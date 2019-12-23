import { Directive, ElementRef, Input } from '@angular/core';

@Directive({ selector: '[vbScroll]' })
export class VbScroll {
  private el: any;

  constructor(el: ElementRef) {
    this.el = el.nativeElement;
  }

  @Input('vbScroll')
  set isActive(toggle: any) {
    toggle && this.scroll();
  }

  scroll() {
    this.el.scrollIntoViewIfNeeded ?
      this.el.scrollIntoViewIfNeeded() :
      this.el.scrollIntoView({ behavior: 'smooth' });
  }
}
