const dispatchHandlers = {
}

export default dispatchHandlers;

export function setDispatchHandler (name, callback) {
  dispatchHandlers[name] = callback;
}
