import { Component, OnInit } from '@angular/core';
import { WebcamImage } from 'ngx-webcam';
import { interval, Observable } from 'rxjs';

import { EmojifierService } from './emojifier.service';
import { EmojiDescriptor } from './emoji-descriptor';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  readonly trigger$ = interval(1000);

  emojiDescriptor$: Observable<EmojiDescriptor>;

  loadedModels$: Observable<boolean>;

  constructor(private readonly emojifierService: EmojifierService) {}

  ngOnInit() {
    this.loadedModels$ = this.emojifierService.loadModels();
  }

  onImageCapture(image: WebcamImage) {
    this.emojiDescriptor$ = this.emojifierService.getEmojiDescriptor(image.imageAsDataUrl);
  }
}
