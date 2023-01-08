$(function(){
	var
	  winW = $(window).width(),
		winH = $(window).height(),
		nav = $('#mainnav ul a'),
		curPos = $(this).scrollTop();
	
	if (winW > 880){
		var headerH =20;
	}
	else{
		var headerH =60;
	}

	$('.panel').hide();

	$('#menuWrap').toggle(function(){
		$(this).next().slideToggle();
		$('#menuBtn').toggleClass('close');
	},
	function(){
		$(this).next().slideToggle();
		$('#menuBtn').removeClass('close');
	});

	var query = getUrlQueries();
	console.log("QUERY ", query);
	if ("page" in query) {
		contents.src = query["page"] + "/index.html";
	} else {
		contents.src = "top.html";
	}
});

function getUrlQueries() {
	var queryStr = window.location.search.slice(1);
	queries = {};

	if (queryStr) {
		queryStr.split('&').forEach(function(queryStr) {
			var queryArr = queryStr.split('=');
			queries[queryArr[0]] = queryArr[1];
		});
	}
	return queries;
}

function selectMenu() {
	var	winW = $(window).width();
	if (winW < 800) {
		$('#menuWrap').next().slideToggle();
		$('#menuBtn').removeClass('close');
	}
	window.scroll({top: 0, behavior: 'smooth'});
}

function adjustFrame() {
  contents = document.getElementById("contents");
  contents.style.height = contents.contentWindow.document.body.scrollHeight + "px";
}
