import nextra from "nextra";

const withNextra = nextra({
  latex: true,
  search: {
    codeblocks: false,
  },
});

export default withNextra({
  output: "export",
  images: {
    unoptimized: true,
  },
  distDir: "out",
});
