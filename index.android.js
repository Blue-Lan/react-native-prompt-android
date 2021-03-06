const PromptAndroid = require('NativeModules').PromptAndroid;

export type PromptType = $Enum<{
    /**
     * Default alert with no inputs
     */
        'default': string,
    /**
     * Plain text input alert
     */
        'plain-text': string,
    /**
     * Secure text input alert
     */
        'secure-text': string,
}>;

type Options = {
    cancelable?: ?boolean;
    type?: ?PromptType;
    defaultValue?: ?String;
    placeholder?: ?String;
};

/**
 * Array or buttons
 * @typedef {Array} ButtonsArray
 * @property {string=} text Button label
 * @property {Function=} onPress Callback function when button pressed
 */
type ButtonsArray = Array<{
    /**
     * Button label
     */
        text?: string,
    /**
     * Callback function when button pressed
     */
        onPress?: ?Function,
}>;

export default function prompt(
    title: ?string,
    message?: ?string,
    callbackOrButtons?: ?((text: string) => void) | ButtonsArray,
    options?: Options
): void {
    let buttons = callbackOrButtons;
    let config = {
        title: title || '',
        message: message || '',
    };

    if (typeof callbackOrButtons === 'function') {
        buttons.push({
            text: 'OK',
            onPress: callbackOrButtons
        });
    }

    if (options) {
        config = {
            ...config,
            cancelable: options.cancelable !== false,
            type: options.type || 'defalt',
            defaultValue: options.defaultValue || '',
            placeholder: options.placeholder || ''
        };
    }
    // At most three buttons (neutral, negative, positive). Ignore rest.
    // The text 'OK' should be probably localized. iOS Alert does that in native.
    const validButtons: Buttons = buttons ? buttons.slice(0, 3) : [{text: 'OK'}];
    const buttonPositive = validButtons.pop();
    const buttonNegative = validButtons.pop();
    const buttonNeutral = validButtons.pop();

    if (buttonNeutral) {
        config = {...config, buttonNeutral: buttonNeutral.text || '' };
    }
    if (buttonNegative) {
        config = {...config, buttonNegative: buttonNegative.text || '' };
    }
    if (buttonPositive) {
        config = {
            ...config,
            buttonPositive: buttonPositive.text || ''
        };
    }


    PromptAndroid.promptWithArgs(
        config,
        (action, buttonKey, input) => {
            if (action !== PromptAndroid.buttonClicked) {
                return;
            }
            if (buttonKey === PromptAndroid.buttonNeutral) {
                buttonNeutral.onPress && buttonNeutral.onPress(input);
            } else if (buttonKey === PromptAndroid.buttonNegative) {
                buttonNegative.onPress && buttonNegative.onPress();
            } else if (buttonKey === PromptAndroid.buttonPositive) {
                buttonPositive.onPress && buttonPositive.onPress(input);
            }
        }
    );
}
