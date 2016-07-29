$(document).ready(function() {
	$.ajax({
		url : 'content/stuff.html',
		type : 'GET',
		success: function(data) {
			alert(data);
		},
		error: function(request, status, error) {
			alert("error");
		}
	});
});