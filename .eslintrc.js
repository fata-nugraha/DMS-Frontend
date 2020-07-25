module.exports = {
	root: true,
	env: {
		browser: true,
		node: true
	},
	parserOptions: {
		parser: "babel-eslint"
	},
	extends: ["@nuxtjs", "plugin:nuxt/recommended"],
	// add your custom rules here
	rules: {
		"no-tabs": 0,
    "vue/comment-directive": 0,
    "no-undef": 0
	}
};
