//Esse código está licenciado em GNU GPLv3 ou superior @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3-or-Later Copyright (C) 2014  Henrique Andrade

// Esse .js depende da jquery para funcionar. Caso ela não esteja em uso no CMS descomente a linha abaixo.

//var script = document.createElement('script');script.src = 'http://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js';script.type = 'text/javascript';document.getElementsByTagName('head')[0].appendChild(script);

var enderecoLista = "User:HAndrade (WMF)/Testes/DAB"; //edite essa linha com o nome da página wiki utilizada pelo projeto para listas as palavras. Caso seu projeto ainda não tenha criado uma página acesse XXX para mais informações.
var chamadaAPI = "http://pt.wikipedia.org/w/api.php?format=json&action=query&prop=revisions&rvprop=content&callback=?&titles="+enderecoLista;

function criaLinks(palavrasChave, palavrasLink, blocosConteudo){
 var blocos = blocosConteudo.length;
 palavras = palavrasChave.length;
 for(var x = 0; x < blocos; x++){
  texto = document.getElementById(blocosConteudo[x]).innerHTML;
  for(var k = 0; k < palavras; k++){
   texto = texto.replace(new RegExp(palavrasLink[k],"g"), "<a href='http://pt.wikipedia.org/wiki/"+palavrasChave[k]+"'>"+palavrasLink[k]+"</a>");
  } // fecha for conteudo
  document.getElementById(blocosConteudo[x]).innerHTML = texto;
 } // fecha for blocos
} // fecha funcao criaLinks()


$(document).ready(function(){
    $.ajax({
        type: "GET",
        url: chamadaAPI,
        contentType: "application/json; charset=utf-8",
        async: false,
        dataType: "json",
        success: function (data, textStatus, jqXHR) {
		var pageId = Object.keys(data.query.pages);
		var texto = data.query.pages[pageId].revisions[0]["*"];
		texto = texto.replace(/(\r\n|\n|\r)/gm,"");
		var palavras = texto.match(/==\sPalavras.*==\sBlocos\sde\sConteúdo/g);
		palavras = palavras[0].match(/\[\[.*?\]\]/g);
		for(i=0;i<palavras.length;i++){ palavras[i] = palavras[i].replace(new RegExp("\\[\\[","g"), ""); }
		for(i=0;i<palavras.length;i++){ palavras[i] = palavras[i].replace(new RegExp("\\]\\]","g"), ""); }
		var palavrasLink = new Array();
		for(i=0;i<palavras.length;i++){ 
			if (palavras[i].match(/\|/)){
				palavrasLink[i] = palavras[i].replace(new RegExp("^.*?\\|"), "");
				palavras[i] = palavras[i].replace(new RegExp("\\|.*?$"), "");

			}else{
				palavrasLink[i] = palavras[i];
			}
		}

		var nomeBlocos = texto.match(/==\sBlocos\sde\sConteúdo.*\[\[Categoria/g);
		nomeBlocos = nomeBlocos[0].match(/".*?"/g);
		for(i=0;i<nomeBlocos.length;i++){ nomeBlocos[i] = nomeBlocos[i].replace(new RegExp('"','g'), ''); }


		criaLinks(palavras,palavrasLink,nomeBlocos);
        },
        error: function (errorMessage) {
		console.log(errorMessage);
        }
    });
});
