export default function h5Copy(content) {

	if (!document.queryCommandSupported('copy')) {
		// 不支持
		return false
	}

	let textarea = document.createElement("textarea");
	textarea.value = content;
	textarea.readOnly = "readOnly";
	document.body.appendChild(textarea);
	// 选择对象
	textarea.select();
	// 核心
	textarea.setSelectionRange(0, content.length);
	// 执行浏览器复制命令
	let result = document.execCommand("copy");
	textarea.remove();
	return result

}
