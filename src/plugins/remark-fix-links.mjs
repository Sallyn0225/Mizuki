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
				(node.url.startsWith(".") || !node.url.startsWith("/")) &&
				node.url.toLowerCase().endsWith(".md") &&
				!node.url.startsWith("http")
			) {
				// 0. 处理 URL 编码（如 %20）
				let decodedUrl = node.url;
				try {
					decodedUrl = decodeURI(node.url);
				} catch (e) {
					// 忽略解码错误
				}

				// 1. 获取当前文件相对于 posts 目录的目录路径
				const currentDir = path.dirname(currentFile);

				// 2. 将相对链接解析为绝对路径（相对于系统根目录）
				// 使用 path.join 而不是 path.resolve，因为 decodedUrl 可能是以 .. 开头的相对路径
				// 并且我们需要确保它在 postsDir 内部
				const targetFile = path.normalize(
					path.join(currentDir, decodedUrl),
				);

				// 3. 计算目标文件相对于 posts 目录的相对路径
				let relativeToPosts = path.relative(postsDir, targetFile);

				// 4. 统一处理路径分隔符为正斜杠（跨平台兼容）
				// 强制将所有反斜杠转换为正斜杠，并处理可能的平台差异
				relativeToPosts = relativeToPosts.replace(/\\/g, "/");

				// 5. 移除 .md 后缀
				let slug = relativeToPosts.replace(/\.md$/i, "");

				// 6. 关键修复：模拟 Astro 的默认 slugify 逻辑
				// Astro 的默认逻辑：
				// - 转小写
				// - 空格转短横线 (-)
				// - 移除特殊字符，但保留非 ASCII 字符（如中文）
				// 注意：slugify 应该分别作用于路径的每一段，而不是整个路径
				const slugParts = slug.split("/").map((part) => {
					return part
						.toLowerCase()
						.replace(/\s+/g, "-") // 空格转 -
						.replace(/[<>:"/\\|?*\x00-\x1F]/g, "") // 移除 Windows 文件名非法字符
						.replace(/-+/g, "-"); // 多个 - 转单个 -
				});
				slug = slugParts.join("/");

				// 7. 构造最终的站点 URL
				// 加上 /posts/ 前缀，并确保不包含双斜杠
				node.url = `/posts/${slug}/`.replace(/\/+/g, "/");

				// console.log(`[remark-fix-links] Fixed: ${node.url}`);
			}
		});
	};
}
