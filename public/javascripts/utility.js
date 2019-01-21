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