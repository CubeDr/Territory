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