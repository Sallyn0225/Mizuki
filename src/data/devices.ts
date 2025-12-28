// 设备数据配置文件

export interface Device {
	name: string;
	image: string;
	specs: string;
	description: string;
	link: string;
}

// 设备类别类型，支持品牌和自定义类别
export type DeviceCategory = {
	[categoryName: string]: Device[];
} & {
	自定义?: Device[];
};

export const devicesData: DeviceCategory = {
	Phone: [
		{
			name: "Redmi Note 12Turbo",
			image: "/images/device/redmi-note-12turbo.png",
			specs: "冰羽白 / 12G + 256GB",
			description:
				"高通第二代骁龙 7+ 性能芯，5000mAh 大电量 / 67W 旗舰秒充",
			link: "https://www.mi.com/redmi-note-12-turbo",
		},
	],
	Laptop: [
		{
			name: "天选3锐龙版",
			image: "/images/device/asus-tianxuan-3.png",
			specs: "RTX3060 / AMD Ryzen 7 6800H",
			description:
				"锐龙6000系列R7处理器，发烧级4G独显，144Hz显示屏，背光键盘",
			link: "https://www.asus.com.cn/laptops/for-gaming/tuf-gaming/asus-tuf-gaming-f15-2022/",
		},
	],
};
