所有的參數都來自 /src/common/css/_my-theme.variable.scss 底下的參數，可在這裡新增參數就會增加可用的樣式
# 預設樣式
## color
c-{color}
結果為
```css
color: {color}
```
## background
bg-{color}
結果為
```css
background-color: {color}
```
## text-align
|名稱|樣式|
|--|--|
|t-al-c|text-align:center|
|t-al-l|text-align:left|
|t-al-r|text-align:right|

> 等級的數量限制由/src/common/css/general/index.scss做設定

## padding
pad-{方向}-{等級}

## margin
mar-{方向}-{等級}

上面兩個的方向有以下：

| 名稱 | 方向內容 |
|--|--|
|all|四個方向
|l-r|左右|
|t-b|上下|
|l|左|
|r|右|
|t|上|
|b|下|

等級則有些許不同，請看index.scss
目前每個等級為16px

## font-size
fs-{種類}

## material-icon 語文自置中方法
md-size-{文字大小等級}


# 預設SCSS參數及方法

## 斷點
app-breakpoint({總類}){
  {想加上的css內容}
}

## 顏色
app-color({顏色},{透明度})

## 高度 z-index
$popup-zIndex

## 圓角
app-border-radius({種類})

## 字體大小
app-font-size({種類})

## 其他樣式
```css
.c-white {
  color: white;
}

.c-black {
  color: black;
}

.bg-white {
  background-color: white;
}

.bg-black {
  background-color: black;
}

.fill-remaining-space {
  flex: 1 1 auto;
}

.bg-cover {
  background-size: cover;
  background-position: center;
}

.cursor-pointer {
  cursor: pointer;
}

.transition {
  transition: all .195s cubic-bezier(0.4, 0.0, 1, 1);
}

.transition-long {
  transition: all .295s cubic-bezier(0.4, 0.0, 1, 1);
}

.cycle-img {
  border-radius: app-border-radius(cycle);
  overflow: hidden;
}
.mar-0 {
  margin-top: 0;
  margin-bottom: 0;
}

.width-full {
  width: 100%;
}

.width-half {
  width: 50%;
}

.fb-button {
  background: #234ca2;
}

.google-button {
  background: #dd4b39
}

.avatar-img {
  display: inline-block;
  height: 40px;
  width: 40px;
  border-radius: 50%;
  flex-shrink: 0;
  background-size: cover;
}
```
