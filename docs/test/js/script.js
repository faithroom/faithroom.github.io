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
});

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
  contents.style.height = contents.contentWindow.document.body.scrollHeight + 20 + "px";
}
