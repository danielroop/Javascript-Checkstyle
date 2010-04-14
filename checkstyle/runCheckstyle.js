//Checkstyle script for Dojo
var buildTimerStart = (new Date()).getTime();

load("../buildscripts/jslib/logger.js");
load("../buildscripts/jslib/fileUtil.js");
load("../buildscripts/jslib/buildUtil.js");
load("checkstyleUtil.js");

//*****************************************************************************

if(arguments[0] == "help"){
	print("Usage: \n\tTo generate a HTML report on dojo, dijit and dojox folders use:\n\t\t"
		+ "checkstyle \n\t"
		+ "To specify a single directory to check in, including all child folders, use:\n\t\t"
		+ "checkstyle dir={folderName}\n\t"
		+ "To specify a list of files to process, use the 'files' parameter, passing a list of space separated files, e.g.\n\t\t"
		+ "checkstyle files=\"dojo/_base/Color.js dojo/back.js\"\n\t"
		+ "To force the script to fail when a specified file has failed the check, use the 'failOnError' parameter, e.g.\n\t\t"
		+ "checkstyle failOnError=true files=\"dojo/_base/Color.js dojo/back.js\"\n\t"
		+ "To commit fixes made by the checkstyleReport.html tool, use\n\t\t"
		+ "checkstyle commit");
		
} else if(arguments[0] == "commit"){
	runCommit();
} else{
	
	//Convert arguments to keyword arguments.
	var kwArgs = buildUtil.makeBuildOptions(arguments);

	checkstyle();

	var buildTime = ((new Date().getTime() - buildTimerStart) / 1000);
	print("Build time: " + buildTime + " seconds");

}
//*****************************************************************************

//********* Start checkstyle *********
function checkstyle(){
	
	var dirs, i;
	
	var reportFile = kwArgs.reportFile || "checkstyleData.js";

	reportFile = "./" + reportFile;
	
	if(kwArgs.files){
		var files = kwArgs.files.split(" ");
		
		for(i = 0; i < files.length; i++){
			checkstyleUtil.applyRules(files[i], fileUtil.readFile(files[i]));
		}
		if(checkstyleUtil.errors){
			var errors = checkstyleUtil.serializeErrors();
			if(kwArgs.failOnError == "true"){
				throw Error("Checkstyle failed. \n" + errors);
			} else{
				print(errors);
			}
		}
		return;
	}
	
	
	if(kwArgs.dir){
		dirs = [kwArgs.dir];
	}
	
	for(i = 0; i < dirs.length; i++){
		var fileList = fileUtil.getFilteredFileList(dirs[i], /\.js$/, true);
		for(var j = 0; j < fileList.length; j++){
			if(fileList[j].indexOf("/test") < 0
				&& fileList[j].indexOf("/nls") < 0 
				&& fileList[j].indexOf("/demos") < 0){
				checkstyleUtil.applyRules(fileList[j], fileUtil.readFile(fileList[j]));
			}
		}
	}
	var report = checkstyleUtil.generateReport();
	fileUtil.saveUtf8File(reportFile, report);
}

//********* End checkstyle *********