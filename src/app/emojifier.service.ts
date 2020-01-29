import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import * as faceApi from 'face-api.js';
import { Observable, from, of } from 'rxjs';
import { mapTo, catchError, map } from 'rxjs/operators';

import { EmojiDescriptor } from './emoji-descriptor';

@Injectable({
  providedIn: 'root'
})
export class EmojifierService {

  private readonly emojiMap = new Map<string, string>([
    ['neutral', 'https://d1j8pt39hxlh3d.cloudfront.net/products/previews/5KFQVEM7GGWW6GPUYFNI/2295_yth3K1ZKeCteucDTUEtFcl2n6zpJN7JF.gif'],
    ['happy', 'https://d1j8pt39hxlh3d.cloudfront.net/products/previews/5KFQVEM7GGWW6GPUYFNI/2294_fzkb876uQtDBtwNdPIDnYjDGCs9nhqTt.gif'],
    ['angry', 'https://d1j8pt39hxlh3d.cloudfront.net/products/previews/5KFQVEM7GGWW6GPUYFNI/2372_8ajgCUasV0xjQkuEx3QzAkxqf7EDpu9F.gif'],
    ['sad', 'https://d1j8pt39hxlh3d.cloudfront.net/products/previews/5KFQVEM7GGWW6GPUYFNI/2311_t8p5qp7j0m4ZZkEyla0b2N4yzvnA8peg.gif️'],
    ['disgusted', 'https://d1j8pt39hxlh3d.cloudfront.net/products/previews/5KFQVEM7GGWW6GPUYFNI/2329_CIw8jtrHPjwWth8cdBCmxlV9uXc7cKEs.gif'],
    ['fearful', 'https://d1j8pt39hxlh3d.cloudfront.net/products/previews/5KFQVEM7GGWW6GPUYFNI/2322_CN7kbToYnYgr9mROifO9oWOBasqkg1qA.gif'],
    ['surprised', 'https://d1j8pt39hxlh3d.cloudfront.net/products/previews/5KFQVEM7GGWW6GPUYFNI/2320_Qzf9qz5zsy3LauRouFJ85oJ0nRTRk3uJ.gif']
  ]);

  constructor(@Inject(DOCUMENT) private readonly document: Document) { }

  loadModels(): Observable<boolean> {
    const mobileNetLoader = faceApi.loadSsdMobilenetv1Model('/assets/models');
    const faceExpressionLoader = faceApi.loadFaceExpressionModel('/assets/models');
    return from(Promise.all([mobileNetLoader, faceExpressionLoader]))
      .pipe(mapTo(true), catchError(() => of(false)));
  }

  getEmojiDescriptor(imageDataUrl: string): Observable<EmojiDescriptor> {
    return from(this.detectFaceProperties(imageDataUrl))
      .pipe(
        map(({ detection, expression }) => {
          return {
            emoji: this.emojiMap.get(expression),
            x: detection.box.x,
            y: detection.box.y,
            size: detection.box.width
          };
        })
      );
  }

  private detectFaceProperties(imageDataUrl: string): Observable<{ detection: faceApi.FaceDetection; expression: string; }> {
    const imageElement = this.createImageElement(imageDataUrl);
    return from(faceApi.detectSingleFace(imageElement).withFaceExpressions().run())
      .pipe(
        map(({ detection, expressions }={detection:undefined,expressions:undefined} as any) => {
          if (!detection){return null};
          const { expression } = expressions.asSortedArray()[0];
          return { detection, expression };
        })
      );
  }

  private createImageElement(imageDataUrl: string): HTMLImageElement {
    const imageElement = this.document.createElement('img');
    imageElement.src = imageDataUrl;
    return imageElement;
  }
}