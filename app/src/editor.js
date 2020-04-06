import axios from 'axios'

import DOMHelper from "./dom-helper";
import EditorText from "./editot-text";

import "./iframe-load"

export default class Editor {
    constructor() {
        this.iframe = document.querySelector("iframe")
    }

    open(page, cb) {
        this.currentPage = page;
        axios
            .get('../' + page + "?rnd=" + Math.random())
            .then(res => DOMHelper.parseStrToDom(res.data))
            .then(DOMHelper.wrapTextNodes)
            .then((dom) => {
                DOMHelper.virtualDom = dom
                return dom
            })
            .then(DOMHelper.serializeDomToStr)
            .then(html => axios.post("./api/saveTempPage.php", { html }))
            .then(() => this.iframe.load("../erwrtwehgeegegs_dsfsdf.html"))
            .then(() => axios.post("./api/delTempPage.php"))
            .then(() => this.enableEditing())
            .then(() => this.injectStyles())
            .then(cb)

    }

    enableEditing() {
        this.iframe.contentDocument.body.querySelectorAll("text-editor").forEach(el => {
            const id = el.getAttribute("nodeid")
            const virtualElement = DOMHelper.virtualDom.body.querySelector(`[nodeid="${id}"]`)
            new EditorText(el, virtualElement)
        })
    }

    injectStyles() {
        const style = this.iframe.contentDocument.createElement('style')
        style.innerHTML = `
        text-editor:hover {
            outline: 3px  solid orange;
            outline-offset: 8px;
        }
        text-editor:focus {
            outline: 3px  solid red;
            outline-offset: 8px;
        }`;
        this.iframe.contentDocument.head.appendChild(style)
    }

    save(onSuccess, onError) {
        const newDom = DOMHelper.virtualDom.cloneNode(DOMHelper.virtualDom)
        DOMHelper.unWrapTextNodes(newDom)
        const html = DOMHelper.serializeDomToStr(newDom)
        axios
            .post("./api/savePage.php", { pageName: this.currentPage, html })
            .then(onSuccess)
            .catch(onError)
    }




}
