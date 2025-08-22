import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/main.ts"],
  outDir: "dist",
  format: ["esm"],
  target: "esnext",
  splitting: false,
  clean: true,
  dts: true,
  sourcemap: true,
  skipNodeModulesBundle: true,
  esbuildOptions(options) {
    options.plugins = [
      {
        name: "fix-extensions",
        setup(build) {
          build.onResolve({ filter: /^\.+\// }, (args) => {
            if (!args.path.endsWith(".ts") && !args.path.endsWith(".js")) {
              return {
                path: args.path + ".js",
                namespace: "file",
              };
            }
          });
        },
      },
    ];
  },
});
