import { parseProxyUrl } from './url';

// NOTE: We should avoid using native object prototype methods,
// since they can be overriden by the client code. (GH-245)
const arrayFilter = Array.prototype.filter;

const STACK_FRAME_REG_EXPS = [
    /^\s*at .*\((\S+)\)/, // Chrome, IE (with function name)
    /^\s*at (\S+)/, // Chrome, IE (without function name)
    /^.*@(\S+)/, // Safari
    /(.+)/ // Any string
];

const ROW_COLUMN_NUMBER_REG_EX = /:\d+:\d+$/;

function replaceUrlWithProxied (str, source) {
    let proxiedUrl      = null;
    let rowColumnSuffix = '';

    if (ROW_COLUMN_NUMBER_REG_EX.test(source)) {
        const sourceMatch = source.match(ROW_COLUMN_NUMBER_REG_EX);

        proxiedUrl      = source.substring(0, sourceMatch.index);
        rowColumnSuffix = sourceMatch[0];
    }
    else
        proxiedUrl = source;

    const parsedProxiedUrl = parseProxyUrl(proxiedUrl);
    const destUrl          = parsedProxiedUrl && parsedProxiedUrl.destUrl;

    if (!destUrl)
        return str;

    const newSource = destUrl + rowColumnSuffix;

    return str.replace(source, newSource);
}

export default function replaceProxiedUrlsInStack (stack) {
    if (!stack)
        return stack;

    const stackFrames = stack.split('\n');

    for (let i = 0; i < stackFrames.length; i++) {
        const stackFrame = stackFrames[i];

        const targetStackFrameRegExp = arrayFilter.call(STACK_FRAME_REG_EXPS, stackFrameRegExp => stackFrameRegExp.test(stackFrame))[0];

        stackFrames[i] = stackFrame.replace(targetStackFrameRegExp, replaceUrlWithProxied);
    }

    return stackFrames.join('\n');
}
