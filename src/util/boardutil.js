/**
 * 根据参数返回矩阵名称集合
 * @param {Char} x 'F' 高
 * @param {Number} y 8 宽
 * @returns 
 */
export function generate_boards(x, y) {
    const result = [];
    const startChar = 'A'.charCodeAt(0);
    const endChar = x.toUpperCase().charCodeAt(0);

    for (let i = startChar; i <= endChar; i++) {
        for (let j = 1; j <= y; j++) {
            result.push(String.fromCharCode(i) + j);
        }
    }

    return result;
}
/**
 * 根据参数返回矩阵名称集合
 * @param {Number} x 高
 * @param {Number} y 宽
 * @returns 
 */
export function create_boards(x, y) {
    const result = [];
    const startChar = 'A'.charCodeAt(0); // 'A' 的 ASCII 码值是 65

    for (let i = 0; i < x; i++) {
        for (let j = 0; j < y; j++) {
            // 使用 startChar + i 来生成从 'A' 开始的字母
            result.push(String.fromCharCode(startChar + i) + (j + 1));
        }
    }

    return result;
}