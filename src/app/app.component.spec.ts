import { TestBed, async } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { VbCaptions } from './components/vb-captions/vb-captions';
import { VbDrop } from './components/vb-drop/vb-drop';
import { VbScroll } from './components/vb-scroll/vb-scroll';
import { VbVideo } from './components/vb-video/vb-video';
import { SubtitlesParser } from './services/subtitles-parser';

describe('App: Videobook', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        VbCaptions,
        VbDrop,
        VbScroll,
        VbVideo
      ],
      providers: [SubtitlesParser]
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'videobook'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app.title).toEqual('');
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled).toBeDefined();
  });
});
