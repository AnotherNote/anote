### ANote

简单的笔记本(现在只支持markdown :)).

**note: 暂时只支持mac**

[![quick_note.gif](http://s21.postimg.org/9pke2wjiv/quick_note.gif)](http://postimg.org/image/8aite6ifn/)

[![past_image.gif](http://s15.postimg.org/kdk0dn2aj/past_image.gif)](http://postimg.org/image/4fbani82f/)

[![past_html.gif](http://s10.postimg.org/3sa87qn2x/past_html.gif)](http://postimg.org/image/q48114m6t/)

[![export_as_pdf.gif](http://s21.postimg.org/5p2q0rz5z/export_as_pdf.gif)](http://postimg.org/image/p6xdgpw3n/)

### 功能

- markdown编辑器比较友好
- 粘贴图片
- 粘贴html(html 2 markdown，并且把图片抓取到本地)
- 可以导出markdown文件，并且导出图片
- 导出pdf文件
- 支持tray menu的速记
- 默认``cmd+v``可以判断剪切板的格式（html或者纯文本），``alt+v``以纯文本方式粘贴

### 目标

我需要一个markdown笔记本，并且尽量顺手，可以我自己控制数据(~/anote)，并且我希望你们也喜欢它 ：）

### 将要做

-	写一个chrome的插件（书签功能），可以抓取文章，或只是书签收藏
-	写一个后台的程序支持同步，并且，可以配置第三方云存储
-	手机应用程序
-	添加文件存储功能

### 参考

-	Evernote
-	Pandao editor (use the editor style, I like it)

### 下载

[去下载](https://pan.baidu.com/s/1jI58ugu)

### 编译打包app


```
npm install

npm run build

npm run package
```

**note: 首先 install electron 、 babel 、 electron-packager并且，我的 node is 6.4**

### 运行源码

```
npm run develop
```

### 利用的技术栈

-	Electron
-	React
-	Redux
-	Babel
-	Material Ui
-	jquery

### 加入我们

如果你喜欢它，联系我 wpcreep@gmail.com，我们一起玩耍。
