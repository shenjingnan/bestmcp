import nextra from "nextra";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const withNextra = nextra({
  latex: true,
  search: {
    codeblocks: false,
  },
});

const isDev = process.env.NODE_ENV === "development";

export default withNextra({
  // 只在生产环境启用静态导出
  ...(isDev ? {} : {
    output: "export",
    distDir: "out",
    outputFileTracingRoot: join(__dirname, ".."),
    trailingSlash: true,
  }),
  images: {
    unoptimized: true,
  },
});
