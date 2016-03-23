/**
 * game.js : script principal pour "Darts Contest"
 * 
 * Par Philippe Bousquet <darken33.free.fr>
 * Ce logiciel est sous license GNU Genral Public License v3.0
 */ 
 
var game_version  = "1.0";
var key = "c9743834fdea177548a64b6028a2a69f";
var internet_ok = false;
var serviceGetNameListUrl = "http://darken33.free.fr/applications/services/drkvstrade/vstrade_getNamesList.php";
var serviceGetBestTradeUrl = "http://darken33.free.fr/applications/services/drkvstrade/vstrade_getBestTrade.php";
var initialised = false;

/** Affichage de la page de chargement */ 
function showPageLoading() {
	$.mobile.changePage('#loading', 'none', true, true);
}

/** Affichage de la page de titre*/ 
function showPageTitre() {
	$.mobile.changePage('#titre', 'none', true, true);
}

/** Affichage de la page de trade */ 
function showPageTrade() {
	$.mobile.changePage('#trade', 'none', true, true);
}

function showPageResult() {
	$.mobile.changePage('#result', 'none', true, true);
}

/** Affichage de la page de dons */ 
function showPageDons() {
	$.mobile.changePage('#pdons', 'none', true, true);
}

/** Affichage de la page d'aide */ 
function showPageAide() {
	$.mobile.changePage('#aide', 'none', true, true);
}


/** quit **/ 
function quit() {
	if (confirm("Really want to quit ?")) window.close();
}

/** bindMenu **/
function bindMenu() {
	if (internet_ok) {
		$("#m_txt_trade").removeClass("ui-disabled");
		$("#m_txt_trade").on("tap", function(event) {
			event.preventDefault();
			event.stopPropagation();
			showPageTrade();
		});
	}	
	$("#m_txt_aide").on("tap", function(event) {
		event.preventDefault();
		event.stopPropagation();
		showPageAide();
	});
	$("#m_txt_dons").on("tap", function(event) {
		event.preventDefault();
		event.stopPropagation();
		showPageDons();
	});
	$("#m_txt_quitter").on("tap", function(event) {
		event.preventDefault();
		event.stopPropagation();
		quit(); 
	});
	$("#help_back").on("tap", function(event) {
		event.preventDefault();
		event.stopPropagation();
		showPageTitre();
	});
	$("#dons_back").on("tap", function(event) {
		event.preventDefault();
		event.stopPropagation();
		showPageTitre();
	});
	$("#result_back").on("tap", function(event) {
		event.preventDefault();
		event.stopPropagation();
		$('#resultset').html("").collapsibleset().collapsibleset( "refresh" );
		showPageTrade();
	});
	$("#trade_back").on("tap", function(event) {
		event.preventDefault();
		event.stopPropagation();
		showPageTitre();
	});
	$("#b_trade_search").on("tap", function(event) {
		event.preventDefault();
		event.stopPropagation();
		serviceGetBestTrade();
	});
	showPageTitre();
}

/** on remplit les select de noms **/
function fillNames(nameList) {
	var planetsName="";
	var installationsNames="";
	var vesselsNames="";
	var i=0;
	for (i=0; i < nameList.length; i++) {
		var option = '<option value="'+nameList[i].id_name+'">'+nameList[i].name+'</option>';
		if ("Planets" == nameList[i].type) planetsName+=option;
		else if ("Installation" == nameList[i].type) installationsNames+=option;
		else if ("Vessel" == nameList[i].type) vesselsNames+=option;
	}
	// on met a jour les selects 
	$('#planets').html(planetsName).selectmenu().selectmenu("refresh");
	$('#installations').html(installationsNames).selectmenu().selectmenu("refresh");
	$('#vessels').html(vesselsNames).selectmenu().selectmenu("refresh");
}

/** on remplit les select de noms **/
function fillTrades(tradeList) {
	var currentFrom="";
	var currentTo="";
	var list='<div id="resultset" data-role="collapsible-set">';
	var nto=0;
	if (tradeList.length == 0) {
			list+='<div data-role="collapsible" data-collapsed="false" data-theme="d">';
			list+='<h3>No Trade Result</h3>';
			list+='<ul class="ui-listview" data-role="listview">';
			list+='<li class=" ui-li-static ui-body-c" data-theme="c">';
			list+='<p>';
			list+='<strong>There is no good trade transaction beetween theses locations.</strong><br/>';
			list+='</p>'
			list+='</li>';
			list+='</ul>';
			list+='</div>';
	}
	for (i=0; i < tradeList.length; i++) {
		if (currentFrom != tradeList[i].dname) {
			currentFrom = tradeList[i].dname;
			currentTo="";
			if (i>0) {
				list+='</ul>';
				list+='</div>';
			}
			list+='<div data-role="collapsible" data-collapsed="'+(i==0 ? 'false' : 'true')+'" data-theme="b">';
			list+='<h3>From '+tradeList[i].dname+'</h3>';
			list+='<ul class="ui-listview" data-role="listview">';
		}
		if (currentTo != tradeList[i].aname) {
			currentTo = tradeList[i].aname;
			list+='<li class="ui-li-divider ui-bar-b ui-first-child" role="heading" data-role="list-divider" data-theme="b">To '+tradeList[i].aname+'</li>';
		}
		list+='<li '+(tradeList[i].gain_min < 0 ? 'class="risky' : 'class="')+' ui-li-static ui-body-c" data-theme="c">';
		list+='<p>';
		list+='<strong>'+tradeList[i].product+'</strong><br/>';
		list+='You should gain about '+Math.round((tradeList[i].gain_moy  * 10000))/100+'%<br/>';
		list+='Available stock : '+tradeList[i].quantity+'<br/>';
		if (tradeList[i].gain_min < 0) list+='<strong style="color:#FF0000">This transaction is risky</strong>';
		list+='</p>'
		list+='</li>';
	}
	if (tradeList.length>0) {
		list+='</ul>';
		list+='</div>';
	}
	list+='</div>';
	$('#rs').html(list);
	$('#resultset').collapsibleset().collapsibleset( "refresh" );
	showPageResult();
}

/** initialisation de la liste des noms **/
function serviceGetNameList() {
	$.getJSON(serviceGetNameListUrl+"?key="+key, function(data) {
		internet_ok = true;
		$('#error').html("");
		fillNames(data);
		bindMenu();
	}).fail(function() { 
		$('#error').html("No internet connection.");
		bindMenu();
	});
}

/** calcul des trades **/
function serviceGetBestTrade() {
	var p = ($("#planets").val() != null ? $("#planets").val() : Array());
	var i = ($("#installations").val() != null ? $("#installations").val() : Array());
	var v = ($("#vessels").val() != null ? $("#vessels").val() : Array());
	if ((p.length + i.length + v.length) < 2) {
		alert("You have to select 2 locations at least.");
	}	
	else {
		showPageLoading();
		var id_name_list = p.join(";");
		id_name_list+=(id_name_list.length>0 && i.length>0 ? ";" : "")+i.join(";");
		id_name_list+=(id_name_list.length>0 && v.length>0 ? ";" : "")+v.join(";");
		$.getJSON(serviceGetBestTradeUrl+"?key="+key+"&id_name_list="+id_name_list+"&risky="+($("#risky").is(":checked") ? "1" : "0"), function(data) {
			fillTrades(data);
		}).fail(function() { 
			alert("Error, is your internet connection OK ?");
			showPageTrade();
		});
	}	
}
   
/** initialisation automatique **/
$( document ).ready(function() {
	showPageLoading();
	serviceGetNameList();
});
