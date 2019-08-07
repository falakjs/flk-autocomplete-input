const Component = require(COMPONENT_CLASS_PATH);

class AutocompleteInputComponent extends Component {}

module.exports = {
    selector: 'flk-autocomplete-input',
    isChild: false,
    handler: AutocompleteInputComponent,
    isUnique: false,
    component: 'AutocompleteInput',
    htmlFile: __dirname + '/../../flk-autocomplete-input.component.html',
};