/*
 ! 修改 twbs-pagination 成 vanilla javascript版本，並新增參數
 */
/*
 ! twbs-pagination 資訊
 * jQuery pagination plugin v1.4.2
 * http://josecebe.github.io/twbs-pagination/
 *
 * Copyright 2014-2018, Eugene Simakin
 * Released under Apache 2.0 license
 * http://apache.org/licenses/LICENSE-2.0.html
 */

/*
 ! 使用方式
 * 執行方式
 * selector.twbsPagination([options | method]); // vanilla javascript形式，仿jQuery執行方式
 * $(selector).twbsPagination([options | method]); // jQuery形式，jQuery有無引入都可使用
 *
 * options (Object) 功能
 * method  (String) 執行
 *
 ! options 參數 (選填)
 * totalPages: 1, // (Number) 總頁數
 * startPage: 1, // (Number) 目前頁數
 * visiblePages: 5, // (Number) 顯示頁數
 * initiateStartPageClick: true, // (Bool) 套件初始化後先執行目前頁面的點擊事件
 * hideOnlyOnePage: false, // (Bool) 總頁數只有一頁時隱藏
 * href: false, // (Bool) 產生query string 或 '#'
 * pageVariable: '{{page}}', // (String) 頁碼替換的模板 (沿用twbs，沒功能)
 * totalPagesVariable: '{{total_pages}}', // (String) 總頁數替換的模板 (沿用twbs，沒功能)
 * page: null, // (String) 自訂頁碼標籤 (沿用twbs，沒功能)
 * first: 'First', // (String) first(第一頁)按鈕的文字標籤
 * prev: 'Previous', // (String) previous(上一頁)按鈕的文字標籤
 * next: 'Next', // (String) next(下一頁)按鈕的文字標籤
 * last: 'Last', // (String) last(最後一頁)按鈕的文字標籤
 * loop: false, // (Bool) 分頁輪播
 * onPageClick: null, // (Function) click事件執行callback
 * paginationClass: 'pagination', // (String) 套件的Class
 * firstClass: 'page-item first', // (String) first(第一頁)按鈕的Class
 * prevClass: 'page-item prev', // (String) previous(上一頁)按鈕的Class
 * nextClass: 'page-item next', // (String) next(下一頁)按鈕的Class
 * lastClass: 'page-item last', // (String) last(最後一頁)按鈕的Class
 * pageClass: 'page-item', // (String) 數字頁碼按鈕的Class
 * activeClass: 'active', // (String) active按鈕的Class
 * disabledClass: 'disabled', // (String) disabled按鈕的Class
 * anchorClass: 'page-link', // (String) 頁碼按鈕連結的Class
 * backward: 'backward', // (String) backward(往前頁)按鈕的文字標籤 (往前頁數為visiblePages)
 * forward: 'forward', // (String) forward(往後頁)按鈕的文字標籤 (往後頁數為visiblePages)
 * backwardClass: 'page-item backward', // (String) backward(往前頁)按鈕的Class
 * forwardClass: 'page-item forward', // (String) forward(往後頁)按鈕的Class
 ! method 參數 (選填)
 * destroy 刪除套件內容
 * disable 禁用
 * enable 啟動
 * getCurrentPage 取得現在頁數(array)
 * getTotalPages 取得總頁數(array)
 */
; (function (global) {
    // 儲存已初始化的實例
    const instances = new WeakMap();
    /* 註冊事件 */
    function deepExtend(out) {
        out = out || {};
        for (let i = 1; i < arguments.length; i++) {
            let obj = arguments[i];
            if (!obj) continue;
            for (let key in obj) {
                if (obj.hasOwnProperty(key)) {
                    let rawType = Object.prototype.toString.call(obj[key]);
                    if (rawType === '[object Object]') {
                        out[key] = deepExtend(out[key], obj[key]);
                    } else if (rawType === '[object Array]') {
                        out[key] = deepExtend(new Array(obj[key].length), obj[key]);
                    } else {
                        out[key] = obj[key];
                    }
                }
            }
        }
        return out;
    };
    function extend(out) {
        out = out || {};
        for (let i = 1; i < arguments.length; i++) {
            if (!arguments[i]) continue;
            for (let key in arguments[i]) {
                if (arguments[i].hasOwnProperty(key)) out[key] = arguments[i][key];
            }
        }
        return out;
    };
    // 註冊 replaceAll (相容)
    String.prototype.replaceAll = function (FindText, RepText) {
        let regExp = new RegExp(FindText, 'g');
        return this.replace(regExp, RepText);
    }
    // 是否為真物件
    function isPlainObject(value) {
        if (value === null || typeof value !== 'object') {
            return false;
        }
        return Object.getPrototypeOf(value) === Object.prototype;
    };

    // 註冊 toggleClass
    Element.prototype.toggleClass = function (classnames, switchState) {
        classnames.split(' ').forEach(classname => {
            if (switchState) {
                this.classList.add(classname);
            } else {
                this.classList.remove(classname);
            }
        });
    };

    // 儲存事件的 Map (on/off)
    const eventRegistry = new WeakMap();
    // 註冊 on綁定事件
    Element.prototype.on = function () {
        const parent = this;
        const event = arguments[0];
        let childSelector, handler;

        if (arguments.length === 2) {
            handler = arguments[1]; // 無子選擇器
        } else if (arguments.length === 3) {
            childSelector = arguments[1];
            handler = arguments[2];
        } else {
            throw new Error("Invalid arguments for .on()");
        }
        // 建立事件處理函數
        function eventHandler(e) {
            let target = e.target;
            if (childSelector) {
                target = e.target.closest(childSelector);
                if (!target || !parent.contains(target)) return; // 確保 target 存在且仍然是 parent 的子元素
            }
            handler.call(target, e, e.detail);
        }

        // 記錄事件處理函數
        if (!eventRegistry.has(parent)) {
            eventRegistry.set(parent, new Map());
        }
        if (!eventRegistry.get(parent).has(event)) {
            eventRegistry.get(parent).set(event, []);
        }
        eventRegistry.get(parent).get(event).push({ childSelector, handler: eventHandler });
        parent.addEventListener(event, eventHandler);
        //
        return this;
    };

    // 註冊 off解除事件
    Element.prototype.off = function (event, childSelector) {
        const parent = this;
        if (!eventRegistry.has(parent) || !eventRegistry.get(parent).has(event)) return this;
        // 取得所有綁定的事件處理函數
        const handlers = eventRegistry.get(parent).get(event);
        // 過濾出匹配 childSelector 的事件並移除
        eventRegistry.get(parent).set(event, handlers.filter(({ childSelector: sel, handler }) => {
            if (sel === childSelector) {
                parent.removeEventListener(event, handler);
                return false; // 從列表中移除該事件
            }
            return true;
        }));
        // 如果該事件沒有剩餘的處理函數，則從 Map 中刪除
        if (eventRegistry.get(parent).get(event).length === 0) {
            eventRegistry.get(parent).delete(event);
        }
        if (eventRegistry.get(parent).size === 0) {
            eventRegistry.delete(parent);
        }
        return this;
    };

    // 註冊 hasClass
    Element.prototype.hasClass = function (classNames) {
        return classNames.split(' ').every(className => this.classList.contains(className));
    };

    // 註冊 trigger 事件
    HTMLElement.prototype.trigger = function (eventName, value) {
        // 創建一個自訂事件，並傳遞參數
        const event = new CustomEvent(eventName, {
            detail: value // 將參數放入 detail 屬性
        });
        // 觸發事件
        this.dispatchEvent(event);
    };
    /* plugin */
    const PluginInstance = function (element, options) {
        /* 參數 */
        this.element = element;
        // 預設參數
        let defaults = {
            totalPages: 1, // Number
            startPage: 1, // Number
            visiblePages: 5, // Number
            initiateStartPageClick: true, // Bool
            hideOnlyOnePage: false, // Bool
            href: false, // Bool
            pageVariable: '{{page}}', // String
            totalPagesVariable: '{{total_pages}}', // String
            page: null, // String
            first: 'First', // String
            prev: 'Previous', // String
            next: 'Next', // String
            last: 'Last', // String
            loop: false, // Bool
            onPageClick: null, // Function
            paginationClass: 'pagination', // String
            nextClass: 'page-item next', // String
            prevClass: 'page-item prev', // String
            lastClass: 'page-item last', // String
            firstClass: 'page-item first', // String
            pageClass: 'page-item', // String
            activeClass: 'active', // String
            disabledClass: 'disabled', // String
            anchorClass: 'page-link', // String
            // add new options
            backward: 'backward', // String
            forward: 'forward', // String
            backwardClass: 'page-item backward', // String
            forwardClass: 'page-item forward', // String
        };

        // 合併參數
        let settings = deepExtend({}, defaults, options);
        this.settings = settings;
        /* 驗證 */

        // totalPages
        if (typeof this.settings.totalPages !== 'number' || isNaN(this.settings.totalPages)) {
            throw new Error('totalPages is not of type "number"');
        }
        // startPage
        if (typeof this.settings.startPage !== 'number' || isNaN(this.settings.startPage)){
            throw new Error('startPage is not of type "number"');
        } else if (this.settings.startPage < 1 || this.settings.startPage > this.settings.totalPages) {
            throw new Error('Start page option is incorrect');
        }
        // visiblePages
        if (typeof this.settings.visiblePages !== 'number' || isNaN(this.settings.visiblePages)) {
            throw new Error('visiblePages is not of type "number"');
        }

        // onPageClick
        if (this.settings.onPageClick && typeof this.settings.onPageClick !== 'function') {
            throw new Error('onPageClick is not of type "function"');
        }
        // hideOnlyOnePage
        if (typeof this.settings.hideOnlyOnePage !== 'boolean'){
            throw new Error('hideOnlyOnePage is not of type "boolean"');
        }
        // initiateStartPageClick
        if (typeof this.settings.initiateStartPageClick !== 'boolean'){
            throw new Error('initiateStartPageClick is not of type "boolean"');
        }
        // href
        if (typeof this.settings.href !== 'boolean') {
            throw new Error('href is not of type "boolean"');
        }
        //  設置startPage
        if (this.settings.href) {
            this.settings.startPage = this.getPageFromQueryString();
            if (!this.settings.startPage) {
                this.settings.startPage = 1;
            }
        }

        if (this.settings.hideOnlyOnePage && this.settings.totalPages == 1) {
            if (this.settings.initiateStartPageClick) {
                this.element.trigger('page', 1);
            }
            return this;
        }
        /* 容器 */
        if (!(this.element instanceof HTMLElement)) {
            throw new Error(`${this.element} is not of type DOM`);
        }
        let tagName = this.element.tagName;

        // 清空
        if (this.element.hasChildNodes()){
            this.element.replaceChildren();
        }
        if (tagName === 'UL') {
            this.listContainer = this.element;
        } else {
            let elements = this.element;
            let newListContainer = null;
            let newElem = document.createElement('ul');;
            elements.appendChild(newElem);
            newListContainer = newElem;
            this.listContainer = newListContainer;
            this.element = newListContainer;
        }
        //
        this.listContainer.classList.add(...this.settings.paginationClass.split(' '));
        if (typeof this.settings.onPageClick === 'function') {
            this.element.on('page', this.settings.onPageClick);
        }
        if (this.settings.initiateStartPageClick) {
            this.show(this.settings.startPage);
        } else {
            this.render(this.getPages(this.settings.startPage));
            this.setupEvents();
        }
        /* 回傳以控制 */
        return this;
    };

    PluginInstance.prototype = {
        version: '1.0',
        constructor: PluginInstance,
        //
        destroy: function () {
            this.element.replaceChildren();
            this.element.off('page');
            return this;
        },
        show: function (page) {
            if (page < 1 || page > this.settings.totalPages) {
                throw new Error('Page is incorrect.');
            }
            this.currentPage = page;

            let pages = this.getPages(page);

            this.render(pages);
            this.setupEvents();
            this.element.trigger('page', page);
            return pages;
        },

        enable: function () {
            this.show(this.currentPage);
        },
        disable: function () {
            let _this = this;
            this.listContainer.off('click', 'li').on('click', 'li', function (e) {
                e.preventDefault();
            });
            Array.from(this.listContainer.children).forEach(function (item) {
                if (!item.hasClass(_this.settings.activeClass)) {
                    item.classList.add(..._this.settings.disabledClass.split(' '));
                }
            });
        },

        buildListItems: function (pages) {
            let listItems = [];
            // first
            if (this.settings.first) {
                listItems.push(this.buildItem('first', 1));
            }
            // prev
            if (this.settings.prev) {
                let prev = pages.currentPage > 1 ? pages.currentPage - 1 : this.settings.loop ? this.settings.totalPages : 1;
                listItems.push(this.buildItem('prev', prev));
            }
            // backward
            if (this.settings.backward) {
                let backward = pages.currentPage > this.settings.visiblePages ?
                    pages.currentPage - this.settings.visiblePages:
                    this.settings.loop ? this.settings.totalPages + pages.currentPage - this.settings.visiblePages : 1;
                listItems.push(this.buildItem('backward', backward));
            }
            // numeric items
            for (let i = 0; i < pages.numeric.length; i++) {
                listItems.push(this.buildItem('page', pages.numeric[i]));
            }
            // forward
            if (this.settings.forward) {
                let forward = pages.currentPage + this.settings.visiblePages < this.settings.totalPages ?
                    pages.currentPage + this.settings.visiblePages :
                    this.settings.loop ?
                        pages.currentPage + this.settings.visiblePages > this.settings.totalPages ?
                            pages.currentPage + this.settings.visiblePages - this.settings.totalPages:
                            pages.currentPage + this.settings.visiblePages :
                            this.settings.totalPages;
                listItems.push(this.buildItem('forward', forward));
            }
            // next
            if (this.settings.next) {
                let next = pages.currentPage < this.settings.totalPages ? pages.currentPage + 1 : this.settings.loop ? 1 : this.settings.totalPages;
                listItems.push(this.buildItem('next', next));
            }
            // last
            if (this.settings.last) {
                listItems.push(this.buildItem('last', this.settings.totalPages));
            }

            return listItems;
        },

        buildItem: function (type, page) {
            let itemContainer = document.createElement('li');
            let itemContent = document.createElement('a');
            let itemText = this.settings[type] ? this.makeText(this.settings[type], page) : page;

            itemContainer.classList.add(...this.settings[type + 'Class'].split(' '));
            itemContainer.dataset.page = page;
            itemContainer.dataset.pageType = type;

            itemContent.href = this.makeHref(page);
            itemContent.classList.add(...this.settings.anchorClass.split(' '));
            itemContent.textContent = itemText;
            itemContainer.appendChild(itemContent);

            return itemContainer;
        },

        getPages: function (currentPage) {
            let pages = [];
            let half = Math.floor(this.settings.visiblePages / 2);
            let start = currentPage - half + 1 - this.settings.visiblePages % 2;
            let end = currentPage + half;

            let visiblePages = this.settings.visiblePages;
            if (visiblePages > this.settings.totalPages) {
                visiblePages = this.settings.totalPages;
            }

            // handle boundary case
            if (start <= 0) {
                start = 1;
                end = visiblePages;
            }
            if (end > this.settings.totalPages) {
                start = this.settings.totalPages - visiblePages + 1;
                end = this.settings.totalPages;
            }

            let itemPage = start;
            while (itemPage <= end) {
                pages.push(itemPage);
                itemPage++;
            }

            return { 'currentPage': currentPage, 'numeric': pages };
        },

        render: function (pages) {
            let _this = this;
            // 清空
            this.listContainer.replaceChildren();
            // 取子項
            let items = this.buildListItems(pages);
            // 置入母項
            items.forEach(function (item) {
                _this.listContainer.append(item);
            });
            // 分項處理
            Array.from(this.listContainer.children).forEach(function (item) {
                let pageType = item.dataset.pageType;
                switch (pageType) {
                    case 'page':
                        if (parseInt(item.dataset.page) === pages.currentPage) {
                            item.classList.add(..._this.settings.activeClass.split(' '));
                        }
                        break;
                    case 'first':
                        item.toggleClass(_this.settings.disabledClass, pages.currentPage === 1);
                        break;
                    case 'last':
                        item.toggleClass(_this.settings.disabledClass, pages.currentPage === _this.settings.totalPages);
                        break;
                    case 'prev':
                        item.toggleClass(_this.settings.disabledClass,
                            !_this.settings.loop && pages.currentPage === 1);
                        break;
                    case 'next':
                        item.toggleClass(_this.settings.disabledClass,
                            !_this.settings.loop && pages.currentPage === _this.settings.totalPages);
                        break;
                    case 'backward':
                        item.toggleClass(_this.settings.disabledClass,
                            !_this.settings.loop && pages.currentPage <= _this.settings.visiblePages);
                        break;
                    case 'forward':
                        item.toggleClass(_this.settings.disabledClass,
                            !_this.settings.loop && pages.currentPage + _this.settings.visiblePages > _this.settings.totalPages);
                        break;
                    default:
                        break;

                }
            });
        },
        setupEvents: function () {
            let _this = this;
            this.listContainer.off('click', 'li').on('click', 'li', function (e) {
                if (this.hasClass(_this.settings.disabledClass) || this.hasClass(_this.settings.activeClass)) {
                    return false;
                }
                !_this.settings.href && e.preventDefault();
                _this.show(parseInt(this.dataset.page));
            });
        },

        changeTotalPages: function (totalPages, currentPage) {
            this.settings.totalPages = totalPages;
            return this.show(currentPage);
        },

        makeHref: function (page) {
            return this.settings.href ? this.generateQueryString(page) : '#';
        },

        makeText: function (text, page) {
            return text.replace(this.settings.pageVariable, page)
                .replace(this.settings.totalPagesVariable, this.settings.totalPages)
        },

        getPageFromQueryString: function (searchStr) {
            let search = this.getSearchString(searchStr),
                regex = new RegExp(this.settings.pageVariable + '(=([^&#]*)|&|#|$)'),
                page = regex.exec(search);
            if (!page || !page[2]) {
                return null;
            }
            page = decodeURIComponent(page[2]);
            page = parseInt(page);
            if (isNaN(page)) {
                return null;
            }
            return page;
        },

        generateQueryString: function (pageNumber, searchStr) {
            let search = this.getSearchString(searchStr),
                regex = new RegExp(this.settings.pageVariable + '=*[^&#]*');
            if (!search) return '';
            return '?' + search.replace(regex, this.settings.pageVariable + '=' + pageNumber);
        },

        getSearchString: function (searchStr) {
            let search = searchStr || window.location.search;
            if (search === '') {
                return null;
            }
            if (search.indexOf('?') === 0) search = search.substr(1);
            return search;
        },

        getCurrentPage: function () {
            return this.currentPage;
        },

        getTotalPages: function () {
            return this.settings.totalPages;
        }
    };

    /* 執行 */
    function Plugin(selector, action) {
        const isMethodCall = typeof action === 'string';
        if (selector instanceof NodeList || Array.isArray(selector)) {
            return Array.from(selector).map(el => {
                processElement(el, action, isMethodCall);
            });
        } else if (selector instanceof Element) {
            return processElement(selector, action, isMethodCall);
        } else if (window.jQuery && selector instanceof jQuery) {
            return selector.each(function () {
                processElement(this, action, isMethodCall);
            });
        }
    }
    function processElement(element, action, isMethodCall) {
        let instance = instances.get(element);
        if (isMethodCall) {
            if (instance && typeof instance[action] === 'function') {
                return instance[action]();
            } else {
                console.error(`Method ${action} does not exist on twbsPagination`);
            }
        } else {
            if (!instance) {
                console.log('processElement', element);
                console.log('processElement', action);

                instance = new PluginInstance(element, action);
                instances.set(element, instance);
            }
        }
        return element;
    }
    // 掛載到全域
    if (typeof global.twbsPagination === "undefined") {
        global.twbsPagination = Plugin;
    }
    // 掛載到 jQuery
    if (window.jQuery) {
        jQuery.fn.twbsPagination = function (action) {
            return Plugin(this, action);
        };
    }
    // 掛載到原生 NodeList 和 Element
    if (typeof NodeList.prototype.twbsPagination === "undefined") {
        NodeList.prototype.twbsPagination = function (action) {
            return Plugin(this, action);
        };
    }
    if (typeof Element.prototype.twbsPagination === "undefined") {
        Element.prototype.twbsPagination = function (action) {
            return Plugin(this, action);
        };
    }
    // 如果 jQuery 不存在，定義 $
    if (typeof window.jQuery === "undefined") {
        global.$ = function (selector) {
            const elements = document.querySelectorAll(selector);
            elements.twbsPagination = function (action) {
                return Plugin(elements, action);
            };
            return elements;
        };
    }
})(window);