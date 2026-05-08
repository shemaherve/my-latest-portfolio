export type Metric = {
	value: string;
	label: string;
	detail: string;
};

export type Project = {
	name: string;
	description: string;
	outcome: string;
	stack: string[];
	href: string;
};

export type SkillGroup = {
	title: string;
	items: string[];
};

export type SocialLink = {
	label: string;
	href: string;
};

export const portfolio = {
	owner: {
		name: "Dusabe shema Herve",
		role: "Full stack developer",

		location: "Global / Remote",
		summary:
			"I specialize in building intelligent applications and high-performance web experiences. My work focuses on merging AI capabilities with robust full-stack architectures.",
		email: "dusabeshemaherve@gmail.com",
	},
	metrics: [
		{
			value: "05+",
			label: "Years in Tech",
			detail: "Building and shipping complex software solutions.",
		},
		{
			value: "30+",
			label: "Projects Completed",
			detail: "From AI models to high-scale web platforms.",
		},
		{
			value: "100%",
			label: "Dedication",
			detail: "Committed to clean code and exceptional user experience.",
		},
	] satisfies Metric[],
	highlights: [
		"AI-Powered Solutions",
		"Full-Stack Architecture",
		"Immersive UI/UX Design",
	],
	skillGroups: [
		{
			title: "Core",
			items: ["Next.js", "React", "TypeScript", "Python"],
		},
		{
			title: "AI & Data",
			items: ["OpenAI API", "LangChain", "TensorFlow", "Vector DBs"],
		},
		{
			title: "Tools",
			items: ["Docker", "Vercel", "PostgreSQL", "Tailwind CSS"],
		},
	] satisfies SkillGroup[],
	projects: [
		{
			name: "AI Agent Platform",
			description:
				"A platform for deploying autonomous AI agents that can manage tasks and interact with APIs.",
			outcome: "Scaled to 10k+ active users in 3 months.",
			stack: ["Next.js", "LangChain", "Node.js"],
			href: "#",
		},
		{
			name: "3D Portfolio v2",
			description:
				"An immersive portfolio experience using canvas-based frame animations and cursor tracking.",
			outcome: "Increased user engagement by 40%.",
			stack: ["React", "Framer Motion", "Canvas"],
			href: "#",
		},
		{
			name: "Data Analytics Suite",
			description:
				"A comprehensive suite for real-time data visualization and predictive analytics.",
			outcome: "Adopted by 3 enterprise clients.",
			stack: ["Python", "React", "D3.js"],
			href: "#",
		},
	] satisfies Project[],
	socialLinks: [
		{ label: "GitHub", href: "https://github.com/redoyanul" },
		{ label: "LinkedIn", href: "https://linkedin.com/in/redoyanul" },
		{ label: "Instagram", href: "https://instagram.com/redoyanul" },
	] satisfies SocialLink[],
};
