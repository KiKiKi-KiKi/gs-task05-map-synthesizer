# google map with React

[Google Map React](https://www.npmjs.com/package/google-map-react)

## latitude 緯度 / longitude 軽度

- latitude ... 赤道 0度 (min) 北極/南極 90度 (max)  
  googlemap: -90 - 0 - 90
- longitude ... 旧グリニッジ天文台跡 0度 東西に180度 (max)  
  googlemap: -180 - 0 - 180 

緯度経度は次のように表せる `N deg M:S` -> 0-60分, 0-3600秒

google map: `度 + (m /60) + (s / 3600)`

cf. 
- https://www.pasco.co.jp/recommend/word/word026/
- https://japonyol.net/editor/article/degree-minute-second-lat-lng.html

## Tone.js

https://github.com/Tonejs/Tone.js

cf. 
- https://qiita.com/i-ryo/items/340b9f3b791b7c2f7d18
- https://www.i-ryo.com/entry/2019/05/21/222200
- https://yonepiano.com/2019/03/23/post-58/

#### code

- https://www.daxter-music.jp/chord/c.html

## Calculation distance

```
(x1, y1), (x2, y2)
dist = SQRT( (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1) )
```

- http://www.geisya.or.jp/~mwm48961/kou2/v_coord4.html


## requestAnimationFrame

- https://developer.mozilla.org/ja/docs/Web/API/Window/requestAnimationFrame
- http://yomotsu.net/blog/2013/01/05/fps.html
- https://ja.javascript.info/js-animation

### performance.now()

>`performance.now()` メソッドは、ミリ秒単位で計測された [`DOMHighResTimeStamp`](https://developer.mozilla.org/ja/docs/Web/API/DOMHighResTimeStamp) を返します。  
> https://developer.mozilla.org/ja/docs/Web/API/Performance/now


#### FPS

1秒間のコマ数 frames per second  
cf. https://nvr.bz/topics/knowledge/what-framerate.php

e.g. 

- 5 FPS ... 1 second 5 images
- 50FPS ... 1 second 50 images

> JavaScriptにおけるフレームレートの考え方  
> プログラムにおいては、1000ミリ秒という単位で考えられる  
> `setTimeout` や `setInterval` の秒指定に1000で1秒という値に「30」やら「1」などの値を見ることもあります。 「1」にするという事は1000f/sというCPU処理になる  
> 描画フレームの最高値が60fpsだとすると、1000÷60 fpsより低い値にしても意味がない  
> 60FPS `1000 / 60 = 16.667`  
> 30FPS `1000 / 30 = 33.333`  
> 24FPS `1000 / 24 = 41.667`  
> 8FPS `1000 / 8 = 125`  
> cf. http://wordpress.ideacompo.com/?p=4818

```js
const fps = 30;
let limit = 0;
let requestID;
let time = 0;
let preFrame;

function animation(now = 0) {
  if (limit > 3) { return; }
  const frame = Math.floor((now - time) / (1000 / fps));
  if (preFrame !== frame) { console.log(frame); }
  preFrame = frame;
  if (frame >= fps) {
    time = now;
    limit += 1;
  }
  requestID = requestAnimationFrame(animation);
}

(function() {
  time = performance.now();
  requestID = requestAnimationFrame(animation);
})();
```

#### BPM (tempo)

1分間の4分音符の拍数 Beats Per Minute  
cf. 

- https://ja.wikipedia.org/wiki/%E3%83%86%E3%83%B3%E3%83%9D  
- http://book.studionoah.jp/2014/11/_24/

e.g. 

- 60 BPM ... M.M.=60 => 1 minute 60 beats

```js
let requestID;
let time;
let section = 0;
const minBeat = 16; // 16分音符でカウント
const beatBase = 4; // 4分音符
const bpm = 120;
const m = 60 * 1000;

function animation(now = 0) {
  // 4章節カウント
  if (section >= 4) { return; }
  const elapsed = now - time;
  const beat = Math.floor(elapsed / (m / (bpm * minBeat / beatBase)));
  console.log(section, beat);
  if (beat >= minBeat) {
    time = now;
    section += 1;
  }
  requestID = requestAnimationFrame(animation);
}

(function() {
  time = performance.now();
  requestID = requestAnimationFrame(animation);
})();
```
