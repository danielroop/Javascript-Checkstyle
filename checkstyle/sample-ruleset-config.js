var disableRule = function(fileName, contents, comments){
	return;
};
checkstyleUtil.rules = checkstyleUtil.mergeRuleSets([
	rulesets["dojo"],
	{
//		"useSpaces": checkstyleUtil.createSimpleSearch("\t", "Spaces should be used in place of tabs"),
		"dojo-useTabs": disableRule
	}
]);