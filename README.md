## This project is not maintained anymore...

### ANote

A simple opensource note app(support markdown only :) ).

**Note: Only support mac for now**

[![quick_note.gif](https://i.imgur.com/k5YrBHc.gif)](https://i.imgur.com/k5YrBHc.gif)

[![past_image.gif](https://i.imgur.com/wg5Flr1.gif)](http://i.imgur.com/wg5Flr1.gif)

[![past_html.gif](https://i.imgur.com/sg0qa3I.gif)](https://i.imgur.com/sg0qa3I.gif)


### Features

- markdown friendly
- paste image
- paste html (include fetching image locally)
- export markdown file with images
- export PDF
- support tray menu quick note(inspired by evernote)
- default `cmd+v` will convert html to markdown, and `alt+v` for pasting as plain text(not convert html to markdown)

### Goal

Just need a good note. And want you to enjoy writing.

Know where is my data (~/anote).

### Todo

-	write a chrome plugin for 'bookmark' article (support to markdown or just html)
-	backend server (I may use mongodb with nodejs/ruby) for sync (I hope users can deploy it easily)
-	mobile app
-	add file storage features

### Inspired by

-	Evernote
-	Pandao editor (use the editor style, I like it)

### Download

Go to [Release](https://pan.baidu.com/s/1jI58ugu), then you can download anote app.

### Install/Build from source


```
npm install

npm run build

npm run package
```

**Note: Install electron, babel and electron-packager first, and my node is 6.4**

### Run from source

```
npm run develop
```

### Tech stack

-	Electron
-	React
-	Redux
-	Babel
-	Material Ui
-	jQuery

### Localization

[中文](./chinese_readme)

### Join us

If u like it, contact me at wpcreep@gmail.com. We can do it togethor.
