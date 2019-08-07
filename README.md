# Autocomplete Input

A component for autocomplete input. 

# Installation
`flk install flk-autocomplete-input`

# Usage

`hello-world.component.html`

```html
<flk-autocomplete-input name="country" [items]="this.countriesList"></flk-autocomplete-input>
```

Once the user start typing the items will be displayed based on the user search characters.


# Configurations

The autocomplete component located in `form.autocomplete` location.

# General attributes

Here is a full list of available attributes that could be passed to any `autocomplete` component.

## items

**name**: `[items]` 

**value**: An array of objects, each object **MUST HAVE** `text` and `value` properties.

> If you passed array of scalars `numbers` | `strings` | `boolean`, it will working as the value of each element is the text and the value as well.

Set the autocomplete list items that will be used for search.

> This will be required if there is no `route` attribute passed to the component.   

The schema of any item in the passed `items` or any ajax request should be like this:

```json
[
    {
        "text": "Displayed text",
        "value": "Selected value"
    }
]
```

## cache

**name**: `cache` | `[cache]`

**default**: `true`

**Configuration key**: `cache`

This works only with the `ajax` search.

If set to `true`, then ajax response will be cached.  

## delay

**name**: `delay` | `[delay]`

**default**: `200`

**Configuration key**: `delay`

Set how much delay time after user stops writing to perform search.

> Delay time is in milliseconds.

## limit

**name**: `limit` | `[limit]`

**default**: `0`

**Configuration key**: `limit`

Set the limit of displayed items of the performed search, default to display all.  

> `zero` means display all items.

## min length

**name**: `minlength` | `[minlength]`

**default**: `2`

**Configuration key**: `minlength`

Set how many characters user should write to start searching.


# Input attributes

## name

**name**: `name` | `[name]`

**required**: `false` but **Recommended**

Set the input name.


## placeholder

**name**: `placeholder` | `[placeholder]`

Set the input placeholder.


## required

**name**: `required` | `[required]`

Set the input placeholder.


## value

**name**: `value` | `[value]`

Set the default value of the input.


# Ajax attributes

## route

**name**: `route` | `[route]`

Set the route `relative to endpoint configurations` to search in.

## Request method

**name**: `method` | `[method]`

**default**: `POST`

**Configuration key**: `requestMethod`

The ajax request method.

## Data parameter

**name**: `query` | `[query]`

**default**: `query`

**Configuration key**: `queryParameter`

The sent parameter to the backend `API`.

## Response key

**name**: `response-key` | `[response-key]`

**default**: `records`

**Configuration key**: `responseRecordsKey`

The key from the response that contains the results.

> The key could be written in `dot.notation` i.e `results.records` if the response has a `results` object and a `records` array inside it.


# Events

## Mapping items

**name**: `map` 

Triggered before items are rendered to map the item structure.

Usually this event is used with api responses.

`hello-world.component.html`
```html
<flk-autocomplete-input name="countries" route="/countries" (map)="this.mapCountry(e)"/></flk-autocomplete-input>
```

`hello-world.component.js`

```js
class HelloWorld {
    /**
     * Map the country option to match the item schema of the autocomplete component
     * 
     * @param   {object} country
     * @returns object
     */ 
    mapCountry(country) {
        return {
            text: country.name,
            value: country.id,
        };
    }
}
```

## Item selection
**name**: `select` 

Triggered when user selects an item, the passed value to it is an `item` object.


`hello-world.component.html`
```html
<flk-autocomplete-input name="countries" route="/countries" (select)="this.currentCountry = e"/></flk-autocomplete-input>
```
