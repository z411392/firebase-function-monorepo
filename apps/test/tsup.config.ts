import { defineConfig, Options } from "tsup"
import { writeFile, symlink, unlink, copyFile, access, readFile } from "fs/promises"
import { existsSync } from "fs"
import path from "node:path"

const CWD = __dirname
const DIST_DIR = path.join(CWD, "dist")
const FIREBASE_FUNCTIONS_DEFAULT_VERSION = "^12.7.0"
const FIREBASE_ADMIN_DEFAULT_VERSION = "^3.4.1"

const createPackageJson = async () => {
    const fileContent = await readFile(path.join(CWD, "package.json"), "utf8")
    const pkg = JSON.parse(fileContent) as any

    const dependencies = pkg.dependencies || {}
    const functionsVersion = typeof dependencies["firebase-functions"] === 'string' && dependencies["firebase-functions"].length > 0
        ? dependencies["firebase-functions"]
        : FIREBASE_FUNCTIONS_DEFAULT_VERSION;

    const adminVersion = typeof dependencies["firebase-admin"] === 'string' && dependencies["firebase-admin"].length > 0
        ? dependencies["firebase-admin"]
        : FIREBASE_ADMIN_DEFAULT_VERSION;

    const cloudDeps = {
        "firebase-functions": functionsVersion,
        "firebase-admin": adminVersion,
        // If your project has other required runtime dependencies, please add them here:
        // "other-dependency": dependencies["other-dependency"],
    }

    const packageJson = JSON.stringify({
        name: pkg.name,
        main: "index.js",
        engines: { node: "20" },
        type: "commonjs",
        dependencies: cloudDeps,
    }, null, 2)

    const pathSavedTo = path.join(DIST_DIR, "package.json")
    console.log(`📦 [tsup] Saved deployment package.json to ${pathSavedTo}`)
    await writeFile(pathSavedTo, packageJson)
}

const symlinkNodeModules = async () => {
    const target = path.join(CWD, "node_modules")
    const link = path.join(DIST_DIR, "node_modules")
    try {
        await access(target)
    } catch (e) {
        console.warn("⚠️ [tsup] Target node_modules not found. Skipping symlink.")
        return
    }

    try {
        if (existsSync(link)) await unlink(link)
        await symlink(target, link, "junction")
        console.log("🔗 [tsup] Symlink created: dist/node_modules -> ../node_modules")
    } catch (error) {
        console.warn("⚠️ [tsup] Failed to create symlink (Expected if deployment handles dependencies):", (error as Error).message)
    }
}

const copyEnvToDist = async () => {
    const envFiles = [".env", ".env.local"]
    let copiedCount = 0

    for (const filename of envFiles) {
        const sourcePath = path.join(CWD, filename)
        const destPath = path.join(DIST_DIR, filename)

        try {
            await access(sourcePath)
            await copyFile(sourcePath, destPath)
            console.log(`📋 [tsup] Copied ${filename} to dist/`)
            copiedCount++
        } catch (error) { }
    }

    if (copiedCount !== 0) return
    console.log("⚠️ [tsup] No .env files found/copied. (If using Firebase config, ignore this warning)")
}


export default defineConfig((options: Options) => ({
    entry: ["src/index.ts"],
    format: ["cjs"],
    minify: !options.watch,
    clean: false,
    outDir: "dist",
    sourcemap: true,
    external: ["firebase-functions", "firebase-admin"],

    onSuccess: async () => {
        await Promise.all([
            createPackageJson(),
            copyEnvToDist(),
            symlinkNodeModules(),
        ])
        console.log("✅ [tsup] Build and deployment preparation completed.")
    },
}))