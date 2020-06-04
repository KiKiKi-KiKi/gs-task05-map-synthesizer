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
