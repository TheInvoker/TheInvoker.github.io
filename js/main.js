function isScrolledIntoView(elem) {
    var docViewTop = $(".content").scrollTop();
    var docViewBottom = docViewTop + $(".content").height();

    var elemTop = $(elem).offset().top;
    var elemBottom = elemTop + $(elem).height();

    return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
}

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
	
    $(".content").scroll(function() {
		$("div[data-load]").each(function(i, x) {
			if (isScrolledIntoView(x)) {
				var url = $(x).attr("data-load");
				$(x).removeAttr("data-load");
				$.ajax({
					url : url,
					type : 'GET',
					success: function(data) {
						$(x).html(data);
					},
					error: function(request, status, error) {
						alert("error");
					}
				});
			}
		});
    });
	

});