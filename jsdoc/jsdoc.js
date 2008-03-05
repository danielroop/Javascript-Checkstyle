dojo.addOnLoad(function(){
	dojo.query("#jsdoc-manage table").forEach(function(table){
		dojo.query("input", table).forEach(function(checkbox){
			var parts = checkbox.value.split("|");
			var project = parts[0];
			var title = parts[1];
			var nid = parts[2];
			var vid = parts[3];
			dojo.connect(checkbox, "onchange", function(e){
				if(!e.target.checked){
					dojo.query("select", table).forEach(function(select){
						if(select.name.indexOf("object[" + project + "]") == 0){
							var i = select.options.length++;
							select.options[i].value = nid + "_" + vid;
							select.options[i].text = title;
						}
					});
				}else{
					dojo.query("option[value=" + nid + "_" + vid + "]", table).orphan();
				}
			});
		});
	});
});