// 这样不是很好，用了eventEmitter在react中，用于tray note新建之后添加到list中
const EventEmitter = require('events');
var singleEvent = new EventEmitter();
export default singleEvent;
