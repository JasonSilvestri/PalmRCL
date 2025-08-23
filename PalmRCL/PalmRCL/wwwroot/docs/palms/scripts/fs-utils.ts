import * as fs from "fs";
import * as path from "path";

export type Eol = "crlf" | "lf";

export function normalizeEol(text: string, eol: Eol): string {
    const u = text.replace(/\r?\n/g, "\n");
    return eol === "crlf" ? u.replace(/\n/g, "\r\n") : u;
}

export function ensureDir(p: string) {
    fs.mkdirSync(path.dirname(p), { recursive: true });
}

export function readFileSafe(p: string): string | null {
    try { return fs.readFileSync(p, "utf8"); } catch { return null; }
}

export function writeFileIfChanged(p: string, data: string, eol: Eol = "crlf") {
    const next = normalizeEol(data, eol);
    const prev = readFileSafe(p);
    if (prev === next) return false;
    ensureDir(p);
    fs.writeFileSync(p, next, { encoding: "utf8" }); // UTF-8, no BOM
    return true;
}