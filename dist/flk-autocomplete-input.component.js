class AutocompleteInput {
    /**
     * Constructor
     * Put your required dependencies in the constructor parameters list  
     */
    constructor(http, cache, endpoint) {
        this.http = http;
        this.cacheEngine = cache;
        this.endpoint = endpoint;

        // available events
        // (map) >> Triggered to customize the item that will be displayed in the items list
        // (selecting) >> Triggered when user selects an item

        // available options
        this.delay = 200;
        this.name = null;
        this.cache = true;
        this.minlength = 2; // minimum letters before start searching
        this.value = null;
        this.label = null;
        this.items = null;
        this.ajaxUrl = null;
        this.route = null; // endpoint route
        this.placeholder = null;
        this.limit = 0; // max items to be displayed
        this.ajaxMethod = 'post';
        this.ajaxParam = 'query';
        this.responseKey = 'records';

        // internal items >> private        
        this.itemsMap = null;
        this.onItemSelect = null;
        this.itemsList = [];
        this.id = Random.id(4);
        this.isSearching = false;
        this.inputValue = '';
        this.displayedText = '';
        this.cachePrefix = 'ato' + Random.string(3); // cache prefix
        this.typingTimer = null;
    }
    
    /**
     * Initialize the component
     * This method is triggered before rendering the component
     */
    init() {
        // options
        this.delay = this.inputs.getOption('delay', Config.get('form.autocomplete.delay', 200));
        this.limit = this.inputs.getOption('limit', Config.get('form.autocomplete.limit', 0));
        this.minlength = this.inputs.getOption('ninlength', Config.get('form.autocomplete.minlength', 2));
        this.cache = this.inputs.getOption('cache', Config.get('form.autocomplete.cache', true));

        // ajax options
        this.route = this.inputs.getOption('route');
        this.ajaxMethod = this.inputs.getOption('method', Config.get('form.autocomplete.requestMethod', 'POST'));
        this.ajaxParam = this.inputs.getOption('query', Config.get('form.autocomplete.queryParameter', 'query'));
        this.responseKey = this.inputs.getOption('responseKey', Config.get('form.autocomplete.responseRecordsKey', 'records'));
        
        // input options
        this.name = this.inputs.getOption('name');
        this.placeholder = this.inputs.getOption('placeholder');
        this.label = this.inputs.getOption('label');
        this.required = this.inputs.getOption('required', false);
        this.inputValue = this.inputs.getOption('value');

        // events
        this.itemsMap = this.inputs.getEvent('map');
        this.onItemSelect = this.inputs.getEvent('select');

        // if passed items
        this.items = this.inputs.getProp('items');

        if (this.items) {
            this.prepareItems();
            this.itemsList = Array.clone(this.items);
        }        
    }

    /**
     * Prepare the passed items to the components
     */
    prepareItems() {
        this.items = this.items.map(item => {
            if (Is.scalar(item)) {
                item = {text: item, value: item};
            }
            return item;
        });
    }

    /**
     * Determine if the given searching text is cached
     */
    isCached(text) {
        return this.cacheEngine.has(this.cacheKey(text));
    }

    /**
     * Search for the given text
     */
    search(input) {
        let text = input.value;
        if (input.oldValue && input.oldValue == text || text.length < this.minlength) {
            this.isSearching = false;
            this.isSearching = false;
            this.itemsList = [];
            return;
        }

        input.oldValue = text;

        clearTimeout(this.typingTimer);

        this.typingTimer = setTimeout(async () => {
            if (this.isCached(text)) {
                return this.renderCachedData(text);
            }

            this.isSearching = true;
            this.itemsList = [];
            let results = await this.getItemsFor(text);

            let items = results.map(item => {
                let itemData = this.itemsMap ? this.itemsMap(item) : item;

                return {
                    value: itemData.value,
                    text: itemData.text,
                    label: itemData.text.replace(new RegExp(RegExp.escape(text), 'ig'), matched => {
                        return `<strong>${matched}</strong>`;
                    }),
                };
            }).slice(0, this.limit);

            if (this.cache) {
                this.cacheItems(text, items);
                this.renderCachedData(text);    
            } else {
                this.itemsList = items;
            }
        }, this.delay);
    }

    /**
     * Select item when user clicks on it
     * 
     * @param  object item
     * @returns void
     */
    selectItem(item) {
        this.inputValue = item.value;

        if (this.onItemSelect) {
            this.onItemSelect(item);
        }

        this.displayedText = item.text;

        this.itemsList = [];
    }

    /**
     * Get items for the given text
     * 
     * @param   string text 
     * @return Promise
     */
    getItemsFor(text) {
        return new Promise(async (resolve, reject) => {
            let items = [];
            try {                
                if (this.items) {
                    items = await this.searchInLocalItems(text);
                } else {
                    items = await this.searchUsingAjax(text);
                }

                resolve(items);
            } catch(e) {
                reject(e);
            }
        });
    }

    /**
     * Search using ajax request
     * 
     * @param  string text
     * @return Promise
     */
    searchUsingAjax(text) {
        return new Promise((resolve, reject) => {
            let request;
            let data = {};
            data[this.ajaxParam] = text;
            if (this.ajaxUrl) {
                request = this.http[this.ajaxMethod](this.ajaxUrl, data);
            } else if (this.route) {
                request = this.endpoint[this.ajaxMethod](this.route, data);
            }

            request.then(response => {
                let items = Object.get(response.originalResponse, this.responseKey);
                resolve(items);
            }).catch(reject);
        });
    }

    /**
     * Search in the passed items to the component
     * 
     * @param  string text
     * @return array
     */
    searchInLocalItems(text) {
        return this.items.filter(item => {
            return item.text.match(new RegExp(text, 'ig'));
        });
    }

    /**
     * Get airports from cache
     * 
     * @param string text 
     */
    renderCachedData(text) {
        let items = this.cacheEngine.get(this.cacheKey(text));
        this.isSearching = false;
        this.itemsList = items;
    }

    /**
     * Cache the given items
     * 
     * @param {*} text 
     * @param {*} items 
     */
    cacheItems(text, items) {
        this.cacheEngine.set(this.cacheKey(text), items);
    }

    /**
     * Get the cache key for the given text
     * 
     * @param   string text
     * @returns string
     */
    cacheKey(text) {
        return `${this.cachePrefix}-${text.toLowerCase()}`;
    }
}