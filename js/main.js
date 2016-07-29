$(document).ready(function() {
	$(".menu .menu-collapse-button").click(function() {
		$(".menu").toggleClass("open");
		return false;
	});
	$(".menu .menu-header").on('click', '.menu-item', function() {
		$(".menu").removeClass("open");
		$(".menu-item.selected").removeClass("selected");
		$(this).addClass("selected");
		return false;
	});
	$(".slideshow, .team-slideshow").click(function() {
		var name = $(this).attr("data-title");
		$("a[data-title='" + name + "']").eq(0).click();
		return false;
	});
	
	var count = 0;
	var interval = setInterval(function() {
		var lst = $(".slide img[data-order='" + count + "']");
		if (lst.length > 0) {
			lst.addClass("fadeIn");
			count += 1;
		} else {
			clearInterval(interval);
		}
	}, 0);
});