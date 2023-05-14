import fs from 'node:fs';
import fsPromises from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const toPath = urlOrPath => urlOrPath instanceof URL ? fileURLToPath(urlOrPath) : urlOrPath;
const getPackagePath = cwd => path.resolve(toPath(cwd) ?? '.', 'package.json');

export async function getPackage(cwd) {
    const packageFile = await fsPromises.readFile(getPackagePath(cwd), 'utf8');
    try {
        return JSON.parse(packageFile);
    }
    catch (err) {
        throw new Error(`Error while parsing package.json!`, { cause: err });
    }
}

export function getPackageSync(cwd) {
    const packageFile = fs.readFileSync(getPackagePath(cwd), 'utf8');
    try {
        return JSON.parse(packageFile);
    }
    catch (err) {
        throw new Error(`Error while parsing package.json!`, { cause: err });
    }
}