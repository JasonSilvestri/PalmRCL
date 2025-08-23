import * as fs from "fs";
import * as path from "path";
export function normalizeEol(text, eol) {
    const u = text.replace(/\r?\n/g, "\n");
    return eol === "crlf" ? u.replace(/\n/g, "\r\n") : u;
}
export function ensureDir(p) {
    fs.mkdirSync(path.dirname(p), { recursive: true });
}
export function readFileSafe(p) {
    try {
        return fs.readFileSync(p, "utf8");
    }
    catch {
        return null;
    }
}
export function writeFileIfChanged(p, data, eol = "crlf") {
    const next = normalizeEol(data, eol);
    const prev = readFileSafe(p);
    if (prev === next)
        return false;
    ensureDir(p);
    fs.writeFileSync(p, next, { encoding: "utf8" }); // UTF-8, no BOM
    return true;
}
