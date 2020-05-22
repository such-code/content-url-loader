const calendarFillSvg = require('./assets/calendar-fill.svg');
const dotSvg = require('./assets/dot.svg');

if (
    typeof calendarFillSvg === 'object'
    && calendarFillSvg !== null
    && typeof calendarFillSvg.templateUrl === 'string'
    && /^(\w+\/)*[a-f0-9]+\.svg$/i.test(calendarFillSvg.templateUrl)
) {
    if (
        typeof dotSvg === 'object'
        && dotSvg !== null
        && typeof dotSvg.template === 'string'
        && dotSvg.template.startsWith('<svg')
    ) {
        console.log('Resource loaded as raw <svg></svg> content passed.');
    } else {
        throw Error('Content load test failed.');
    }
} else {
    throw Error('URL test failed.');
}
