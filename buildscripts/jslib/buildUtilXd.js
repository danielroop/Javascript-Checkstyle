//The functions in this file assume that buildUtil.js have been loaded.
var buildUtilXd = {};

buildUtilXd.setXdDojoConfig = function(/*String*/fileContents, /*String*/url){
	//summary: sets sets up xdomain loading for a particular URL.
	//parameters:
	//		fileContents: be a built dojo.js (can be uncompressed or compressed).
	//		url: value should include the /src path for the xdomain dojo.
	//			Example: "http://some.domain.com/dojo-xdversion/src" (no ending slash)
	//This function will inject some contents after the dojo.registerModulePath() definition.
	//The contents of fileName should have been a dojo.js that includes the contents
	//of loader_xd.js (specify -DdojoLoader=xdomain in the build command).


	//This regexp is not very robust. It will break if dojo.registerModulePath definition
	//changes to anything more advanced.
	var insertionRegExp = /(dojo\.registerModulePath\s*=\s*function.*\{[^}]*};?)/;
	
	return fileContents.replace(insertionRegExp, "$1\nif(typeof djConfig[\"useXDomain\"] == \"undefined\"){"
		+ "djConfig.useXDomain = true;};\ndojo.registerModulePath(\"dojo\", \""
		+ url
		+ "\");\n"
	);
}

//START makeXdContents function
//Function that generates the XD version of the module file's contents
buildUtilXd.makeXdContents = function(fileContents, baseRelativePath, prefixes){
	var dependencies = [];
	
	//Use the regexps to find resource dependencies for this module file.
	var depMatches = fileContents.match(buildUtil.globalDependencyRegExp);
	if(depMatches){
		for(var i = 0; i < depMatches.length; i++){
			var partMatches = depMatches[i].match(buildUtil.dependencyPartsRegExp);
			var depCall = partMatches[1];
			var depArgs = partMatches[2];

			if(depCall == "requireLocalization"){
				//Need to find out what locales are available so the dojo loader
				//only has to do one script request for the closest matching locale.
				var reqArgs = buildUtil.getRequireLocalizationArgsFromString(depArgs);
				if(reqArgs.moduleName){
					//Find the list of locales supported by looking at the path names.
					var locales = buildUtil.getLocalesForBundle(reqArgs.moduleName, reqArgs.bundleName, baseRelativePath, prefixes);
					
					//Add the supported locales to the requireLocalization arguments.
					if(!reqArgs.localeName){
						depArgs += ", null";
					}
					
					depCall = "xdRequireLocalization";
					depArgs += ', "' + locales.join(",") + '"';
				}else{
					//Malformed requireLocalization call. Skip it. May be a comment.
					continue;
				}
			}
	
			dependencies.push('"' + depCall + '", ' + depArgs);
		}
	}

	//Build the xd file contents.
	var xdContentsBuffer = [];
	xdContentsBuffer.push("dojo.hostenv.packageLoaded({\n");
	
	//Add in dependencies section.
	if(dependencies.length > 0){
		xdContentsBuffer.push("depends: [");
		for(i = 0; i < dependencies.length; i++){
			if(i > 0){
				xdContentsBuffer.push(",\n");
			}
			xdContentsBuffer.push("[" + dependencies[i] + "]");
		}
		xdContentsBuffer.push("],");
	}
	
	//Add the contents of the file inside a function.
	//Pass in dojo as an argument to the function to help with
	//allowing multiple versions of dojo in a page.
	xdContentsBuffer.push("\ndefinePackage: function(dojo){");
	//Remove requireLocalization calls, since that will mess things up.
	//String() part is needed since fileContents is a Java object.
	xdContentsBuffer.push(String(fileContents).replace(/dojo\.requireLocalization\([^\)]*\)/g, ""));
	xdContentsBuffer.push("\n}});");
	
	return xdContentsBuffer.join("");
}
//END makeXdContents function


//START makeXdBundleContents function
buildUtilXd.makeXdBundleContents = function(prefix, prefixPath, srcFileName, fileContents, baseRelativePath, prefixes){
	print("Flattening bundle: " + srcFileName);

	var bundleParts = buildUtil.getBundlePartsFromFileName(prefix, prefixPath, srcFileName);
	if(!bundleParts){
		return null;
	}
	var moduleName = bundleParts.moduleName;
	var bundleName = bundleParts.bundleName;
	var localeName = bundleParts.localeName;
	
	print("## moduleName: " + moduleName + ", bundleName: " + bundleName + ", localeName: " + localeName);
	
	//If this is a dojo bundle, it will have already been flattened via the normal build process.
	//If it is an external bundle, then we didn't flatten it during the normal build process since
	//right now, we don't make copies of the external module source files. Need to figure that out at some
	//point, but for now, need to get flattened contents for external modules.
	fileContents = (prefix.indexOf("dojo") == 0) ? fileContents : buildUtil.makeFlatBundleContents(prefix, prefixPath, srcFileName);

	//Final XD file contents.
	fileContents = 'dojo.provide("' + moduleName + '.nls.' + (localeName ? localeName + '.' : '') + bundleName + '");'
	                 + 'dojo.hostenv.xdLoadFlattenedBundle("' + moduleName + '", "' + bundleName
                   + '", "' + localeName + '", ' + fileContents + ');';

	//Now make a proper xd.js file out of the content.
	return buildUtilXd.makeXdContents(fileContents, baseRelativePath, prefixes);
}
//END makeXdBundleContents function
