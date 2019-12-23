import { Component, Input, Output, EventEmitter, ElementRef, HostListener } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'vb-video',
  styleUrls: ['./vb-video.css'],
  templateUrl: './vb-video.html'
})
export class VbVideo {

  constructor(private sanitizer: DomSanitizer, private element: ElementRef) { }

  // Video URL
  @Input()
  set videoUrl(url) {
    if (this.videoElement) {
      this.videoElement.src = url;
    }
  }
  get videoUrl() { return this.videoElement ? this.videoElement.src : ''; }

  // Current time
  @Input()
  set currentTime(time) {
    if (this.videoElement && time != null) {
      this.videoElement.currentTime = time;
      this.videoElement.play();
    }
  }
  get currentTime() { return this.videoElement ? this.videoElement.currentTime : 0; }

  // Captions URL
  @Input()
  set captionsUrl(url) {
    this.captionTracks = [];
    this.captionTracks.push({
      url: this.sanitizer.bypassSecurityTrustResourceUrl(url)
    });
  }
  get captionsUrl() {
    return this.captionTracks[0] ? this.captionTracks[0].url : null;
  }
  isFullscreen = false;
  captionTracks = [];
  private activeCaption: TextTrackCue;
  private prevActiveCaption: any;
  private videoElement: HTMLVideoElement;
  displayedText = '';

  // Output stream
  @Output() videoStream: EventEmitter<{}> = new EventEmitter();

  ngAfterViewInit() {
    this.videoElement = this.element.nativeElement.querySelector('video');
  }

  @HostListener('document:keydown', ['$event'])
  onKeyup($event: KeyboardEvent) {
    switch ($event.code) {
      case 'Space':
        $event.preventDefault();
        return this.playPause();
      case 'Enter':
        $event.preventDefault();
        return this.replayCaption();
      case 'ArrowLeft':
      case 'ArrowUp':
        $event.preventDefault();
        return this.nextCaption(-1);
      case 'ArrowDown':
      case 'ArrowRight':
        $event.preventDefault();
        return this.nextCaption(1);
    }
  }

  private playPause() {
    this.videoElement.paused ? this.videoElement.play() : this.videoElement.pause();
  }

  private playCaption(caption: TextTrackCue) {
    if (!caption) { return; }
    this.videoElement.currentTime = caption.startTime;
    this.videoElement.play();
  }

  private replayCaption() {
    const track = this.getTrack();
    if (!track) { return; }
    this.playCaption(this.activeCaption || this.prevActiveCaption || track.cues[0]);
  }

  private nextCaption(delta: number) {
    const track = this.getTrack();
    if (!track) { return; }

    const active = this.activeCaption || this.prevActiveCaption;
    if (!active) { return this.playCaption(track.cues[0]); }

    const index = Array.prototype.indexOf.call(track.cues, active);
    const next = track.cues[index + delta];

    this.playCaption(next);
  }

  private getCaption(cue: TextTrackCue) {
    const caption = {
      id: cue.id,
      startTime: cue.startTime,
      endTime: cue.endTime,
      text: cue.text.replace(/\n/g, '<br>')
    };
    if (!caption.id) {
      delete caption.id;
      caption.id = JSON.stringify(caption);
    }
    return caption;
  }

  private getTrack() {
    const tracks = this.videoElement.textTracks;
    const track = tracks && tracks[0];

    if (!track) { return null; }

    // Hide the built-in captions
    track.mode = 'hidden';

    return track;
  }

  captionsOnLoad() {
    this.activeCaption = null;
    this.prevActiveCaption = null;

    const track = this.getTrack();
    if (!track) { return; }

    this.videoStream.next({
      event: 'captionsReady',
      captions: Array.prototype.map.call(track.cues, this.getCaption, this)
    });
  }

  captionsOnCuechange() {
    if (this.activeCaption) { this.prevActiveCaption = this.activeCaption; }
    this.activeCaption = null;

    const track = this.getTrack();
    if (!track) { return; }

    const activeCue = track.activeCues[0];
    let transformedCaption = null;

    if (activeCue) {
      this.activeCaption = activeCue;
      transformedCaption = this.getCaption(activeCue);

      if (transformedCaption.text) { this.displayedText = transformedCaption.text; }
    }

    this.videoStream.next({
      event: 'captionChange',
      activeCaption: transformedCaption
    });
  }
}
