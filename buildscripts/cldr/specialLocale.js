/**
 * In CLDR, there are some special locales with abnormal hierarchy.
 * 
 * E.g.zh-hk.xml is aliased to zh-hant-hk.xml for all the calendar/number/currency data.
 * So after CLDR transformation, JSON bundles under zh-hk is totally the same as those under zh-hant-hk.
 * Problems will occur when dojo loads zh-hk bundle, as dojo will flatten it with the following sequence:
 * Root -> zh -> zh-hk, but the right sequence should be Root -> zh -> zh-hant -> zh-hk(zh-hant-hk)
 * so the bundles under zh-hant locale is missing.
 * 
 * This script is used to process all the special locales so that after CLDR transformation,
 * zh-hk bundle will be flatted both with zh-hant and zh-hant-hk, nothing will be lost then.
 * Please see the following SPECIAL_LOCALES_MAP for detail mapping info.
 * 
 * Note: Here for simplification, we name zh-hk as source locale,and name zh-hant-hk as alias locale.  
 */
djConfig={baseUrl: "../../../dojo/"};

load("../../../dojo/dojo.js");
load("../jslib/logger.js");
load("../jslib/fileUtil.js");
load("cldrUtil.js");

dojo.require("dojo.i18n");

var dir/*String*/ = arguments[0];// ${dojo}/dojo/cldr/nls

//locales that are generated by ${dojo}/util/buildscripts/cldr/build.xml
var allLocalesStr/*String*/ = arguments[1];//e.g. "ar,ar-eg,en-au,en-ca,en-gb,en-us,de-de,es-es,fr-fr,..."

var logDir = arguments[2];

//related bundles, currently only 'number','currency','gregorian' bundles
//TBD - 'buddhist','chinese','coptic','currency','ethiopic','gregorian','hebrew','islamic','islamic-civil','japanese','persian'
var BUNDLE_MAP = ['number','currency','gregorian'];

//headers for generated bundle files
var NLS_JSON_HEAD = ['// generated from ldml/main/*.xml, xpath: ldml/numbers\n',
				 	 '// generated from ldml/main/*.xml, xpath: ldml/numbers/currencies\n',
				     '// generated from ldml/main/*.xml, xpath: ldml/calendars/calendar-gregorian\n'];

var SPECIAL_LOCALES_MAP = {
	//Mapping info for some special locales with abnormal hierarchy.
	//Currently for CLDR 1.6, will be updated with latest CLDR release.

	'zh-hk':'zh-hant-hk',
	'zh-mo':'zh-hant-mo',		
	'sh':'sr-latn',	
	'mo':'ro-md',
	'pa-pk':'pa-arab-pk',//pa-pk and pa-arab-pk don't exist, but pa-arab exists		
	'zh-tw':'zh-hant-tw',//zh-tw and zh-hant-tw don't exist, but zh-hant exists
	'uz-af':'uz-arab-af',//uz-af and uz-arab-af don't exist, but uz-arab exists
	'ha-sd':'ha-arab-sd',//ha-sd and ha-arab-sd don't exist, but ha-arab exists
	'ku-tr':'ku-latn-tr' //ku-tr and ku-latn-tr don't exist, but ku-latn exists
	
	/* The following locales don't have any bundles currently (CLDR 1.6),
	 * listed here for CLDR future release.
	 *  
	'az-az':'az-latn-az',
	'ha-gh':'ha-latn-gh',
	'ha-ne':'ha-latn-ne',
	'ha-ng':'ha-latn-ng',
	'kk-kz':'kk-cyrl-kz',
	'ku-iq':'ku-latn-iq',
	'ku-ir':'ku-latn-ir',
	'ku-sy':'ku-latn-sy',
	'pa-in':'pa-guru-in',	
	'sr-cs':'sr-cyrl-cs',
	'sr-me':'sr-cyrl-me',
	'sr-rs':'sr-cyrl-rs',
	'sr-yu':'sr-cyrl-rs',	
	'uz-uz':'uz-cyrl-uz',
	'zh-sg':'zh-hans-sg',
	'zh-cn':'zh-hans-cn',
	'mn-cn':'mn-mong-cn',
	'mn-mn':'mn-cyrl-cn',
	'pa-in':'pa-guru-in',
	
	*/
	
	/* Don't need to process the following locale alias
	 * only listed here for futher comparison
	 *
	//sh is already aliased to sr-latn
	'sh-cs':'sr-latn-rs',
	'sh-yu':'sr-latn-rs',
	'sh-ba':'sr-latn-ba',//sh-ba and sr-latn-ba don't exist, but sr-latn exists
	
	//has the same parent
	'sr-cyrl-cs':'sr-cyrl-rs',
	'sr-cyrl-yu':'sr-cyrl-rs',
	
	'sr-cs':'sr-cyrl-cs',
	'sr-me':'sr-cyrl-me',
	'sr-rs':'sr-cyrl-rs',
	'sr-yu':'sr-cyrl-rs',
	'sr-ba':'sr-cyrl-ba',//sr-cyrl is null
	'tg-tj':'tg-cyrl-tj',//tg-cyrl is null
	'ug-cn':'ug-arab-cn',//ug-arab is null
	'uz-uz':'uz-cyrl-uz',//uz-cyrl is null
	'zh-cn':'zh-hans-cn',//zh-hans is null
	'zh-sg':'zh-hans-sg',//zh-hans is null
	*/
};

print('specialLocale.js...');

var srcLocaleList = [];//source locale file paths
for(x in SPECIAL_LOCALES_MAP){
	if(allLocalesStr == '${locales}' //no $locales parameter,all locales required
	   || (allLocalesStr && 0 <= allLocalesStr.indexOf(x))){
		//only if this locale is required
		srcLocaleList.push(dir + '/' + x);
	}
}

/*
 * Get and compare the flattened bundles(using dojo.i18n) of each source locale and its alias
 * Copy those bundles that alias has but source locale doesn't to source locale,
 * and also update new items in source locale bundle
 */
var logStr = "";
for(var i= 0; i < srcLocaleList.length; i++){
	var srcLocalePath = srcLocaleList[i];//source locale path
	var srcPathSegments = srcLocalePath.split("/");
	var srcLocale = srcPathSegments[srcPathSegments.length - 1];
	var aliasLocale = SPECIAL_LOCALES_MAP[srcLocale];
	
	//iterate each bundle
	for(var len = 0; len < BUNDLE_MAP.length; len++){
		try{
			//declare bundles
			dojo.i18n._requireLocalization('dojo.cldr', BUNDLE_MAP[len], srcLocale);
			dojo.i18n._requireLocalization('dojo.cldr', BUNDLE_MAP[len], aliasLocale);
						
			//get bundles
			var srcBundle = dojo.i18n.getLocalization('dojo.cldr', BUNDLE_MAP[len], srcLocale);
			var aliasBundle = dojo.i18n.getLocalization('dojo.cldr', BUNDLE_MAP[len], aliasLocale);
		}catch(e){print(e);/*it's ok if no bundle found*/}
		
		if(!aliasBundle && !srcBundle){ 
			break;			
		}else if(!aliasBundle && srcBundle){
			//should be an error case
			logStr += 'specialLocale.js error: source locale has more bundles than alias locale\n';
			break;
		}else if(aliasBundle && !srcBundle){
			//add the new bundle to source locale
			validateDir(srcLocalePath);
			fileUtil.saveUtf8File(srcLocalePath + '/' + BUNDLE_MAP[len] + '.js', NLS_JSON_HEAD[len] + '(' + dojo.toJson(aliasBundle, true) + ')');
			logStr += "specialLocale.js : copied " + BUNDLE_MAP[len] + '.js to ' + srcLocalePath + '\n';
		}else if(aliasBundle && srcBundle){
			var isUpdated = false;
			//get native bundle whose content is not flattened
			try{
				var nativeSrcBundle = getNativeBundle(srcLocalePath + '/' + BUNDLE_MAP[len] + '.js');
			}catch(e){
				//if no nativeSrcBundle
				nativeSrcBundle = {};
			}

			for(p in aliasBundle){
				if(!isLocaleAliasSrc(p, aliasBundle) // p is not the source of a 'locale' alias mapping 
				   && (!srcBundle[p] || !compare(srcBundle[p], aliasBundle[p]))){
				   //inherit 
				   nativeSrcBundle[p] = aliasBundle[p];
				   //logStr += "copied " + p + "=" + aliasBundle[p] + "\n";
				   isUpdated = true;
				}
			}
			
			if(isUpdated){
				validateDir(srcLocalePath);
				fileUtil.saveUtf8File(srcLocalePath + '/' + BUNDLE_MAP[len] + '.js', NLS_JSON_HEAD[len] + '(' + dojo.toJson(nativeSrcBundle, true) + ')');
				logStr += 'specialLocale.js : updated ' + BUNDLE_MAP[len] + '.js in ' + srcLocalePath + '\n';				
			}
		}
	}
}

fileUtil.saveUtf8File(logDir + '/specialLocale.log',logStr+'\n');

function validateDir(/*String*/dirPath){
	//summary:make sure the dir exists
	var dir = new java.io.File(dirPath);
	if(!dir.exists()){
		dir.mkdir();
	}	
}