import { Component, Input, Output, EventEmitter, ElementRef, HostListener } from '@angular/core';

@Component({
  selector: 'vb-captions',
  styleUrls: ['./vb-captions.css'],
  templateUrl: './vb-captions.html'
})
export class VbCaptions {
  lastActive = null;
  shouldDisableQuotes = true;
  currentActive = null;

  @Input() captions: any[];
  @Output() captionSelect: EventEmitter<{}> = new EventEmitter();

  @Input()
  set activeCaption(caption) {
    this.lastActive = caption ? null : this.currentActive;
    this.currentActive = caption;
  }
  get activeCaption() { return this.currentActive; }

  constructor(private element: ElementRef) { }

  selectCaption(caption: any) {
    this.captionSelect.next({
      caption
    });
  }

  wrapCaption(caption: any) {
    return "<span class=\"vb-captions_invisible_quote\">'</span>" + caption + "<span class=\"vb-captions_invisible_quote\">'</span>";
  }

  @HostListener('document:selectionchange', ['$event'])
  onSelectionChange(event: any) {
    let selected = document.getSelection().toString();
    this.shouldDisableQuotes = selected.length > 0 && selected.includes("\n");
  }

  isPrevActive(caption: { id: any; }) {
    return this.lastActive && (this.lastActive.id === caption.id);
  }

  isActive(caption: { id: any; }) {
    return this.currentActive && (this.currentActive.id === caption.id);
  }
}
