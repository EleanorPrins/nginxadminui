class MonacoEditorManager {
    constructor() {
        this.editor = null; // Store the Monaco editor instance
        this.container = null; // Store the container for the editor
        this.filename = null; // Current filename
        this.content = null; // Current content of the editor
        this.managertwo = null; // Store the Monaco editor instance for the second editor
        this.options = {};

        this.injectMonacoEditorStyles(); // Inject styles when initializing
    }

    injectMonacoEditorStyles() {
        if (document.querySelector(".monacoModalCSS")) {
            return;
        }

        let css = document.createElement("style");
        css.className = "monacoModalCSS";
        css.innerHTML = /*css*/ `
            .monaco-editor-container {
                position: relative;
                width: 100%;
                height: 100%;
                background-color: var(--background-color);
            }

            .monaco-modal, .monaco-double-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                z-index: 1000;
            }

            .monaco-modal {
                justify-content: center;
            }

            .monaco-double-modal {
                justify-content: space-evenly;
            }

            .monaco-modal > .monaco-modal-content {
                background-color: var(--background-color);
                width: 80%;
                height: 80%;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
                position: relative;
                display: flex;
                flex-direction: column;
            }

            .monaco-double-modal > .monaco-modal-content {
                background-color: var(--background-color);
                width: 40%;
                height: 80%;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
                position: relative;
                display: flex;
                flex-direction: column;
            }
    
            .monaco-titlebar {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0.5rem;
                height: 40px;
            }

            .monaco-titlebar .monaco_filename {
                font-size: 1.5rem;
                margin: 0;
                margin-left: 0.5rem;
                padding: 0;
            }
    
            .monaco-titlebar i {
                font-size: 2.5rem;
                margin-right: 1rem;
            }
    
            .monaco-titlebar .monaco_exit:hover {
                color: var(--tertiary-background-color);
                cursor: pointer;
            }
    
            .monaco-titlebar .monaco_save.saved {
                color: var(--success-color);
            }
    
            .monaco-titlebar .monaco_save.saved:hover {
                color: var(--success-color-hover);
                cursor: not-allowed;
            }
    
            .monaco-titlebar .monaco_save:not(.saved) {
                color: var(--error-color);
            }
    
            .monaco-titlebar .monaco_save:not(.saved):hover {
                color: var(--error-color-hover);
                cursor: pointer;
            }
        `;
        document.head.appendChild(css);
    }

    createEditor(container, options) {
        if (this.editor) {
            this.dismissEditor();
        }

        const {
            filename,
            content,
            saveCallback = () => {},
            newfile = false,
            enableTitlebar = true,
            editableFilename = true,
            enableSaveButton = true,
            enableCloseButton = true,
            language = "nginx",
        } = options;

        this.container = container;

        let editorContainer = document.createElement("div");
        editorContainer.className = "monaco-editor-container";

        if (enableTitlebar) {
            let titlebar = document.createElement("div");
            titlebar.className = "monaco-titlebar";
            titlebar.innerHTML = `
                <h3 class="monaco_filename" ${
                    editableFilename ? "contenteditable" : ""
                }>${filename}</h3>
                <div>
                    ${
                        enableSaveButton
                            ? '<i class="monaco_save fa-solid fa-floppy-disk"></i>'
                            : ""
                    }
                    ${
                        enableCloseButton
                            ? '<i class="monaco_exit fa-solid fa-xmark"></i>'
                            : ""
                    }
                </div>
            `;

            editorContainer.appendChild(titlebar);
        }

        let monacoContainer = document.createElement("div");
        monacoContainer.style.height = enableTitlebar
            ? "calc(100% - 40px)"
            : "100%";

        editorContainer.appendChild(monacoContainer);
        container.appendChild(editorContainer);

        this.filename = filename;
        this.content = content;

        if (enableTitlebar) {
            this.setupEventListeners(editorContainer, saveCallback);
        }

        this.setupEditor(
            monacoContainer,
            content,
            filename,
            saveCallback,
            newfile,
            enableTitlebar,
            language
        );
    }

    createModalEditor(options) {
        if (this.editor) {
            this.dismissEditor();
        }

        // Create modal overlay
        let modalOverlay = document.createElement("div");
        modalOverlay.className = "monaco-modal";

        // Create modal content container
        let modalContent = document.createElement("div");
        modalContent.className = "monaco-modal-content";

        // Use the existing createEditor method to setup the editor inside the modal content
        this.createEditor(modalContent, options);

        modalOverlay.appendChild(modalContent);
        document.body.appendChild(modalOverlay);

        // Overwrite dismissEditor to also remove the modal overlay
        this.dismissEditor = () => {
            if (this.editor) {
                this.editor.dispose();
            }
            if (modalOverlay) {
                modalOverlay.remove();
            }
        };
    }

    createDoubleModalEditor(optionsA, optionsB) {
        if (this.editor) {
            this.dismissEditor();
        }

        this.managertwo = new MonacoEditorManager();

        // Create modal overlay
        let modalOverlay = document.createElement("div");
        modalOverlay.className = "monaco-double-modal";

        // Create modal content container
        let modalContent = document.createElement("div");
        modalContent.className = "monaco-modal-content";

        // Use the existing createEditor method to setup the editor inside the modal content
        this.createEditor(modalContent, optionsA);

        // Create modal content container
        let modalContentTwo = document.createElement("div");
        modalContentTwo.className = "monaco-modal-content";

        // Use the existing createEditor method to setup the editor inside the modal content
        this.managertwo.createEditor(modalContentTwo, optionsB);

        modalOverlay.appendChild(modalContent);
        modalOverlay.appendChild(modalContentTwo);
        document.body.appendChild(modalOverlay);

        // Overwrite dismissEditor to also remove the modal overlay
        this.dismissEditor = () => {
            if (this.editor) {
                this.editor.dispose();
            }
            if (this.managertwo.editor) {
                this.managertwo.editor.dispose();
            }
            if (modalOverlay) {
                modalOverlay.remove();
            }
        };

        this.managertwo.dismissEditor = () => {
            if (this.editor) {
                this.editor.dispose();
            }
            if (this.managertwo.editor) {
                this.managertwo.editor.dispose();
            }
            if (modalOverlay) {
                modalOverlay.remove();
            }
        };

        // Replace the keyUp events for both editors to update the save state of both editors
        let saveFunc = () => {
            let saved;
            saved = this.checkSaveState() && this.managertwo.checkSaveState();

            if (saved) {
                this.managertwo.container
                    .querySelector(".monaco_save")
                    .classList.add("saved");
            } else {
                this.managertwo.container
                    .querySelector(".monaco_save")
                    .classList.remove("saved");
            }
        };

        this.editor.onKeyUp(saveFunc);
        this.managertwo.editor.onKeyUp(saveFunc);

        saveFunc();

        // Replace the save button click event for the managertwo editor to also save the first editor
        let saveButton =
            this.managertwo.container.querySelector(".monaco_save");
        $(saveButton).off("click");
        $(saveButton).on("click", () => {
            if (saveButton.classList.contains("saved")) {
                return;
            }

            let filenameA =
                this.container.querySelector(".monaco_filename").innerText;
            let valueA = this.editor.getModel().getValue();

            let filenameB =
                this.managertwo.container.querySelector(
                    ".monaco_filename"
                ).innerText;

            let valueB = this.managertwo.editor.getModel().getValue();

            let succeded = optionsB.saveCallback(
                {
                    content: valueA,
                    filename: filenameA,
                },
                {
                    content: valueB,
                    filename: filenameB,
                }
            );

            if (!succeded) {
                return;
            }

            this.content = valueA;
            this.filename = filenameA;
            this.managertwo.content = valueB;
            this.managertwo.filename = filenameB;

            saveFunc();
            this.checkSaveState();
        });
    }

    setupEditor(
        container,
        content,
        filename,
        saveCallback,
        newfile,
        enableTitlebar,
        language,
        enableSaveButton,
        enableCloseButton
    ) {
        let theme =
            window.matchMedia &&
            window.matchMedia("(prefers-color-scheme: light)").matches
                ? "nginx-theme"
                : "nginx-theme-dark";

        this.editor = monaco.editor.create(container, {
            value: content,
            language: language,
            theme: theme,
            scrollBeyondLastLine: false,
            cursorSmoothCaretAnimation: "explicit",
            cursorBlinking: "blink",
            fontSize: 16,
            automaticLayout: true,
        });

        $(".monaco-editor-container > div:not(.monaco-titlebar)").css(
            "height",
            "calc(100% - 60px)"
        );

        if (enableTitlebar) {
            if (newfile) {
                this.content = null;
                this.filename = null;
            } else {
                this.content = content;
                this.filename = filename;
                if (enableSaveButton) {
                    container
                        .closest(".monaco-editor-container")
                        .querySelector(".monaco_save")
                        .classList.add("saved");
                }
            }

            this.editor.onKeyUp(() => {
                this.checkSaveState();
            });

            this.checkSaveState();

            container
                .closest(".monaco-editor-container")
                .querySelector(".monaco_filename")
                .addEventListener("input", () => {
                    this.checkSaveState();
                });

            this.editor.addCommand(
                monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
                () => {
                    container
                        .closest(".monaco-editor-container")
                        .querySelector(".monaco_save")
                        .click();
                }
            );
        }
    }

    setupEventListeners(editorContainer, saveCallback) {
        let exitButton = editorContainer.querySelector(".monaco_exit");
        let saveButton = editorContainer.querySelector(".monaco_save");

        if (exitButton) {
            $(exitButton).on("click", () => {
                this.dismissEditor();
            });
        }

        if (saveButton) {
            $(saveButton).on("click", () => {
                if (saveButton.classList.contains("saved")) {
                    return;
                }

                let filename =
                    editorContainer.querySelector(".monaco_filename").innerText;
                let value = this.editor.getModel().getValue();

                let succeded = saveCallback({
                    content: value,
                    filename: filename,
                });

                if (!succeded) {
                    return;
                }

                this.content = value;
                this.filename = filename;
                this.checkSaveState();
            });
        }
    }

    checkSaveState() {
        let currentContent = this.editor.getModel().getValue();
        let currentFilename =
            this.container.querySelector(".monaco_filename").innerText;

        let saved = false;
        if (
            this.content !== currentContent ||
            this.filename !== currentFilename
        ) {
            this.container
                .querySelector(".monaco_save")
                ?.classList.remove("saved");
        } else {
            this.container
                .querySelector(".monaco_save")
                ?.classList.add("saved");
            saved = true;
        }

        return saved;
    }

    saveFailed() {
        this.container.querySelector(".monaco_save").classList.remove("saved");
    }

    dismissEditor() {
        if (this.editor) {
            this.editor.dispose();
        }
        if (this.container) {
            this.container.remove();
        }
    }
}
