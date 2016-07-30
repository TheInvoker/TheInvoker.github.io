setTimeout(function() {
	loadContent();
}, 3000);

function loadContent() {
	var xObj = $("div[data-load]")
	if (xObj.length > 0) {
		var x = (xObj.eq(0))[0];
		var url = $(x).attr("data-load");
		$(x).removeAttr("data-load");
		$.ajax({
			url : url,
			type : 'GET',
			success: function(data) {
				$(x).html(data);
				updateGroups();
				loadContent();
			},
			error: function(request, status, error) {
				//alert("error");
			}
		});
	}
}

function updateGroups() {
	$("div[data-members]").each(function(i, x) {
		$(x).html("<div class='group-label'>Members:</div>");
		var membersList = $(x).attr("data-members").split(",");
		for(var i=0; i<membersList.length; i+=1) {
			var member = MEMBERS[membersList[i]];
			$(x).append("<a href='" + member.link + "' target='_blank' title=\"" + member.name + "\">" + member.name + "</a>");
		}
		$(x).removeAttr("data-members");
	});
}