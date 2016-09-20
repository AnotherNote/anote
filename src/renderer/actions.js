import constants from '../constants';
let {
    LIST_BOOKS,
    ADD_BOOK,
    DEL_BOOK,
    EDIT_BOOK,
    CONCAT_BOOKS,
    ACTIVE_BOOK,
    POP_HISTORY,
    PUSH_HISTORY,
    LIST_FILES,
    ADD_FILE,
    DEL_FILE,
    EDIT_FILE,
    CONCAT_FILES,
    ACTIVE_FILE,
    SET_GLOBAL_BOOK,
    SET_EDITOR_STATE
} = constants;

/* book actions */
export function addBook(book) {
    return {
        type: ADD_BOOK,
        book
    }
}

export function listBooks(books) {
    return {
        type: LIST_BOOKS,
        books
    }
}

export function delBook(book) {
    return {
        type: DEL_BOOK,
        book
    }
}

export function editBook(book) {
    return {
        type: EDIT_BOOK,
        book
    }
}

export function concatBooks(books) {
    return {
        type: CONCAT_BOOKS,
        books
    }
}

export function activeBook(book) {
    return {
        type: ACTIVE_BOOK,
        book
    };
}

/* history actions */
export function popHistory() {
    return {
        type: POP_HISTORY
    }
}

export function pushHistory(history) {
    return {
        type: PUSH_HISTORY,
        history
    }
}

/* file actions */
export function listFiles(files) {
    return {
        type: LIST_FILES,
        files
    }
}

export function addFile(file) {
    return {
        type: ADD_FILE,
        file
    }
}

export function delFile(file) {
    return {
        type: DEL_FILE,
        file
    }
}

export function editFile(file) {
    return {
        type: EDIT_FILE,
        file
    }
}

export function concatFiles(files) {
    return {
        type: CONCAT_FILES,
        files
    }
}

// active file
export function activeFile(file) {
    return {
        type: ACTIVE_FILE,
        file
    }
}

// set global book id for create note
export function setGlobalBook(globalBook) {
    return {
        type: SET_GLOBAL_BOOK,
        globalBook
    }
}

// set editorState for anote editor
export function setEditorState(state) {
    return {
        type: SET_EDITOR_STATE,
        state
    }
}
