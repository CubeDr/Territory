function sqDistance(p1, p2) {
    let dx = p1.x - p2.x;
    let dy = p1.y - p2.y;
    return dx * dx + dy * dy;
}

function clipToRange(value, min, max) {
    if(min!=null && value < min) return min;
    if(max!=null && value > max) return max;
    return value;
}

function getValue(value, defaultValue) {
    return value? value: defaultValue;
}

function ignoreEvents(interactive) {
    interactive
        .on('pointerdown',  (p, x, y, e) => e.stopPropagation())
        .on('pointerup',    (p, x, y, e) => e.stopPropagation())
        .on('pointermove',  (p, x, y, e) => e.stopPropagation())
        .on('pointerover',  (p, x, y, e) => e.stopPropagation())
        .on('pointerout',   (p, e) => e.stopPropagation());
}

function getDirectionName(dx, dy) {
    dy = -dy;
    let r = Math.atan(dy / dx) / Math.PI;

    if(dx < 0) r += 1;
    if(r < 0) r += 2;

    let dname = ["E", "NE", "N", "NW", "W", "SW", "S", "SE"];
    for(let d = 0; d < 8; d++) {
        let a = (1 + d*2) / 8;
        if(r <= a) return dname[d];
    }

    return "E";
}

function normalize(dx, dy) {
    let size = Math.sqrt(dx*dx + dy*dy);
    return {
        x: dx / size,
        y: dy / size
    };
}

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

// getDecimal(10.12345, 2) => 10.12
// getDecimal(10.12345, 4) -> 10.1235
function getDecimal(number, precision) {
    let div = 1;
    while(precision-- > 0)
        div *= 10;
    return Math.round(number * div) / div;
}

function doAjax(type, url, data, onSuccess) {
    $.ajax({
        type: type,
        url: 'https://localhost:8080/' + url,
        // Always include an `X-Requested-With` header in every AJAX request,
        // to protect against CSRF attacks.
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        },
        contentType: 'application/octet-stream; charset=utf-8',
        success: onSuccess,
        data: data
    });
}