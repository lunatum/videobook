import { Component, Input, Output, EventEmitter } from '@angular/core';
import { SubtitlesParser } from '../../services/subtitles-parser';

@Component({
  selector: 'vb-drop',
  styleUrls: ['./vb-drop.css'],
  templateUrl: './vb-drop.html'
})
export class VbDrop {
  @Input() url: string;
  @Output() uploadVideo: EventEmitter<{}> = new EventEmitter();
  @Output() uploadCaptions: EventEmitter<{}> = new EventEmitter();

  isDragover = false;
  prevVideoUrl = null;

  constructor(private subParser: SubtitlesParser) { }

  private isCaptions(file: { name: string; }) {
    return /\.(vtt|srt|ass|ssa)$/.test(file.name);
  }

  private loadCaptions(file: Blob) {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = (e: any) => {
      const vtt = this.subParser.toVTT(reader.result as string);
      this.uploadCaptions.next({
        url: 'data:text/vtt;charset=utf-8,' + encodeURIComponent(vtt)
      });
    };
  }

  private loadVideo(file: { type: any; name: any; }) {
    if (this.prevVideoUrl) {
      URL.revokeObjectURL(this.prevVideoUrl);
    }

    this.prevVideoUrl = URL.createObjectURL(file);
    this.uploadVideo.next({
      url: this.prevVideoUrl,
      type: file.type,
      name: file.name
    });
  }

  private stopEvent(e: Event) {
    e.preventDefault();
    e.stopPropagation();
  }

  onDragover(e: DragEvent) {
    this.stopEvent(e);
    this.isDragover = true;
  }

  onDragleave(e: DragEvent) {
    this.stopEvent(e);
    this.isDragover = false;
  }

  onDrop(e: DragEvent) {
    this.stopEvent(e);
    this.isDragover = false;

    Array.prototype.forEach.call(e.dataTransfer.files, (file: any) => {
      this.isCaptions(file) ? this.loadCaptions(file) : this.loadVideo(file);
    });
  }
}
