$(function () {
	var
		winW = $(window).width(),
		winH = $(window).height(),
		nav = $('#mainnav ul a'),
		curPos = $(this).scrollTop();

	if (winW > 880) {
		var headerH = 20;
	}
	else {
		var headerH = 60;
	}

	$('.panel').hide();

	$('#menuWrap').toggle(function () {
		$(this).next().slideToggle();
		$('#menuBtn').toggleClass('close');
	},
		function () {
			$(this).next().slideToggle();
			$('#menuBtn').removeClass('close');
		});

	var query = getUrlQueries();
	console.log("QUERY ", query);
	if ("page" in query) {
		loadPage(query["page"] + "/index.html");
	} else {
		loadPage("top.html");
	}
});

function loadPage(url) {
	// Determine the base directory for relative paths
	var baseDir = url.substring(0, url.lastIndexOf('/') + 1);
	var pageMatch = url.match(/(?:^|\/)([^\/]+)\/index\.html$/i);
	var pageKey = pageMatch ? pageMatch[1] : url.replace(/\.html$/i, '');
	document.body.setAttribute('data-trip-page', pageKey);

	fetch(url)
		.then(function (response) { return response.text(); })
		.then(function (html) {
			// Extract body content from the fetched HTML
			var bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
			var content;
			if (bodyMatch) {
				content = bodyMatch[1];
			} else {
				// Some pages don't have <body> tags, use everything after </head>
				var headEnd = html.indexOf('</head>');
				if (headEnd !== -1) {
					content = html.substring(headEnd + 7);
				} else {
					content = html;
				}
				// Strip closing </html> if present
				content = content.replace(/<\/html>\s*$/i, '');
			}

			// Fix relative paths: src="photo/..." -> src="baseDir/photo/..."
			// Only fix paths that don't start with http/https/data// or /
			if (baseDir && baseDir !== '') {
				content = content.replace(/(src|href)="(?!https?:\/\/|data:|\/|#)([^"]+)"/g, function (match, attr, path) {
					return attr + '="' + baseDir + path + '"';
				});
			}

			document.getElementById('contents').innerHTML = content;
			window.scroll({ top: 0, behavior: 'smooth' });
		})
		.catch(function (err) {
			console.error('Failed to load page:', err);
		});
}

function getUrlQueries() {
	var queryStr = window.location.search.slice(1);
	queries = {};

	if (queryStr) {
		queryStr.split('&').forEach(function (queryStr) {
			var queryArr = queryStr.split('=');
			queries[queryArr[0]] = queryArr[1];
		});
	}
	return queries;
}

function selectMenu() {
	var winW = $(window).width();
	if (winW < 800) {
		$('#menuWrap').next().slideToggle();
		$('#menuBtn').removeClass('close');
	}
	window.scroll({ top: 0, behavior: 'smooth' });
}
