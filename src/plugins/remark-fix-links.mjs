import path from "node:path";
import fs from "node:fs";
import { visit } from "unist-util-visit";

/**
 * 递归获取目录下所有 Markdown 文件
 */
function getAllMdFiles(dir, baseDir, fileList = []) {
	const files = fs.readdirSync(dir);
	for (const file of files) {
		const filePath = path.join(dir, file);
		const stat = fs.statSync(filePath);
		if (stat.isDirectory()) {
			getAllMdFiles(filePath, baseDir, fileList);
		} else if (file.toLowerCase().endsWith(".md")) {
			// 存储相对于 baseDir 的路径，并统一使用正斜杠
			const relativePath = path
				.relative(baseDir, filePath)
				.split(path.sep)
				.join("/");
			fileList.push({
				name: file.toLowerCase(),
				relativePath: relativePath,
			});
		}
	}
	return fileList;
}

let mdFilesCache = null;

export function remarkFixLinks() {
	return (tree, file) => {
		const currentFile = file.path;
		if (!currentFile) return;

		const postsDir = path.join(file.cwd, "src", "content", "posts");

		// 只有在目录存在时才初始化缓存
		if (!mdFilesCache && fs.existsSync(postsDir)) {
			mdFilesCache = getAllMdFiles(postsDir, postsDir);
		}

		visit(tree, "link", (node) => {
			// 只处理相对路径且以 .md 结尾的链接，排除 http 链接
			if (
				(node.url.startsWith(".") || !node.url.startsWith("/")) &&
				node.url.toLowerCase().endsWith(".md") &&
				!node.url.startsWith("http")
			) {
				let decodedUrl = node.url;
				try {
					decodedUrl = decodeURI(node.url);
				} catch (e) {
					// 忽略解码错误
				}

				// 统一处理链接中的路径分隔符
				const normalizedLinkUrl = decodedUrl.split(/[\\/]/).join("/");
				const linkFileName = path
					.basename(normalizedLinkUrl)
					.toLowerCase();

				// 1. 尝试常规相对路径解析
				const currentDir = path.dirname(currentFile);
				const targetFileAbs = path.normalize(
					path.join(currentDir, decodedUrl),
				);

				let finalRelativePath = null;

				// 检查相对路径解析出的文件是否存在
				if (fs.existsSync(targetFileAbs)) {
					finalRelativePath = path
						.relative(postsDir, targetFileAbs)
						.split(path.sep)
						.join("/");
				}
				// 2. 如果相对路径找不到，尝试在全局索引中匹配文件名 (Obsidian 风格)
				else if (mdFilesCache) {
					const match = mdFilesCache.find(
						(f) => f.name === linkFileName,
					);
					if (match) {
						finalRelativePath = match.relativePath;
					}
				}

				// 如果找到了有效的路径，则更新 URL
				if (finalRelativePath) {
					// 移除 .md 后缀
					let slug = finalRelativePath.replace(/\.md$/i, "");

					// 模拟 Astro 的默认 slugify 逻辑
					const slugParts = slug.split("/").map((part) => {
						return part
							.toLowerCase()
							.replace(/\s+/g, "-") // 空格转 -
							.replace(/[<>:"|?*\x00-\x1F]/g, "") // 移除 Windows 文件名非法字符
							.replace(/-+/g, "-"); // 多个 - 转单个 -
					});
					slug = slugParts.join("/");

					// 构造最终的站点 URL
					node.url = `/posts/${slug}/`.replace(/\/+/g, "/");
					// console.log(`[remark-fix-links] Fixed: ${node.url} (from ${decodedUrl})`);
				} else {
					// console.warn(`[remark-fix-links] Could not resolve: ${decodedUrl}`);
				}
			}
		});
	};
}
