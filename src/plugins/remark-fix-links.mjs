import path from "node:path";
import { visit } from "unist-util-visit";

export function remarkFixLinks() {
	return (tree, file) => {
		// file.path 是当前 Markdown 文件的绝对路径
		const currentFile = file.path;
		if (!currentFile) return;

		// 获取 content/posts 目录的绝对路径
		// 假设项目根目录在 file.cwd
		const postsDir = path.join(file.cwd, "src", "content", "posts");

		visit(tree, "link", (node) => {
			// 只处理相对路径且以 .md 结尾的链接
			if (
				node.url.startsWith(".") &&
				node.url.endsWith(".md") &&
				!node.url.startsWith("http")
			) {
				// 1. 获取当前文件相对于 posts 目录的目录路径
				const currentDir = path.dirname(currentFile);

				// 2. 将相对链接解析为绝对路径（相对于系统根目录）
				const targetFile = path.resolve(currentDir, node.url);

				// 3. 计算目标文件相对于 posts 目录的相对路径
				let relativeToPosts = path.relative(postsDir, targetFile);

				// 4. 统一处理路径分隔符为正斜杠（Windows 兼容）
				relativeToPosts = relativeToPosts.split(path.sep).join("/");

				// 5. 移除 .md 后缀
				const slug = relativeToPosts.replace(/\.md$/, "");

				// 6. 构造最终的站点 URL
				// 加上 /posts/ 前缀，并确保不包含双斜杠
				node.url = `/posts/${slug}/`.replace(/\/+/g, "/");

				// console.log(`[remark-fix-links] Fixed: ${node.url}`);
			}
		});
	};
}
