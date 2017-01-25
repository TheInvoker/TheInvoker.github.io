var MEMBERS = {
	'1' : {
		'name' : 'Ryan D\'Souza',
		'link' : 'https://ca.linkedin.com/in/ryanstevedsouza647'
	},
	'2' : {
		'name' : 'Betty Da',
		'link' : 'http://www.zombo.com/'
	},
	'3' : {
		'name' : 'Per Parker',
		'link' : 'https://www.linkedin.com/in/per-parker-343ba3a0'
	},
	'4' : {
		'name' : 'Adam Ortiz',
		'link' : 'http://www.hello-world.ca/'
	},
	'5' : {
		'name' : 'Caradec Bisesar',
		'link' : 'https://www.linkedin.com/in/caradec-bisesar-b3552443'
	},
	'6' : {
		'name' : 'Jamie Tung',
		'link' : 'https://www.linkedin.com/in/jamietung'
	},
	'7' : {
		'name' : 'James Jing',
		'link' : 'https://www.linkedin.com/in/james-jing-2502437a'
	},
	'8' : {
		'name' : 'David Xing',
		'link' : 'https://www.linkedin.com/in/david-xing-897a5430'
	},
	'9' : {
		'name' : 'Wei Chen',
		'link' : 'https://www.linkedin.com/in/wei-chen-4550081a'
	},
	'10' : {
		'name' : 'Yang Wang',
		'link' : 'https://www.linkedin.com/in/yang-wang-124a9691'
	},
	'11' : {
		'name' : 'Vladimir Vassilovski',
		'link' : 'https://www.linkedin.com/in/vlad-vassilovski-2b4b6758'
	},
	'12' : {
		'name' : 'Victor B.',
		'link' : 'javascript:void(0);'
	},
	'13' : {
		'name' : 'Jason Du',
		'link' : 'https://www.linkedin.com/in/jasoncdu'
	},
	'14' : {
		'name' : 'Kareem Kwong',
		'link' : 'https://www.linkedin.com/in/kwngo'
	},
	'15' : {
		'name' : 'Eliza Lee',
		'link' : 'https://www.linkedin.com/in/seunghyunlee'
	},
	'16' : {
		'name' : 'Lisa Chen',
		'link' : 'https://ca.linkedin.com/in/lisa-chen-655770a2'
	},
	'17' : {
		'name' : 'Akshay Nair',
		'link' : 'https://www.linkedin.com/in/nairakshay'
	},
	'18' : {
		'name' : 'Jianan Han',
		'link' : 'https://www.linkedin.com/in/jianan-han-a2400132'
	},
	'19' : {
		'name' : 'Christopher Aranadi',
		'link' : 'https://www.linkedin.com/in/christopher-aranadi-815984110'
	},
	'20' : {
		'name' : 'Fidelia Hung',
		'link' : 'https://www.linkedin.com/in/fidehunglaw'
	},
	'21' : {
		'name' : 'Sarah Minassian',
		'link' : 'https://www.linkedin.com/in/serounigminassian'
	},
	'22' : {
		'name' : 'Eddie Wang',
		'link' : 'https://www.linkedin.com/in/eddieywang'
	},
	'23' : {
		'name' : 'Jeffrey Huang',
		'link' : 'https://www.linkedin.com/in/jeffreyphuang'
	},
	'24' : {
		'name' : 'Tiffany Rodrigues',
		'link' : 'https://www.linkedin.com/in/tiffany-rodrigues-b254aba4'
	}
};

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
	$(".content").on("click", ".slideshow, .team-slideshow", function() {
		var name = $(this).attr("data-title");
		$("a[data-title='" + name + "']").eq(0).click();
		return false;
	});
	
	$(".content").on("click", ".details summary", function() {
		$(this).parent().toggleClass("open");
		$(this).next().toggleClass("open");
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
	}, 150);
});