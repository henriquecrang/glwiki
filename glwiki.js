//Esse código está licenciado em GNU GPLv3 ou superior @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3-or-Later Copyright (C) 2014  Henrique Andrade

// Esse .js depende da jquery para funcionar. Caso ela não esteja em uso no CMS descomente a linha abaixo.

//var script = document.createElement('script');script.src = 'http://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js';script.type = 'text/javascript';document.getElementsByTagName('head')[0].appendChild(script);

(function($){

  var glwiki = {};

  //-- Variaveis configuraveis ---

  // flag para iniciar automaticamente
  glwiki.inicioAutomatico = true;

  // jquery string para selecionar os blocos de texto dentro do html da página
  // OBS não use a tab body se o script estiver dentro dela!
  glwiki.seletorTags = ['.node'];

  // lista de tags permitidas
  glwiki.tagsPermitidas = ['div', 'p', 'span'];

  glwiki.linkClass = 'glwiki';

  // página padrão para pegar a lista de termos
  glwiki.enderecoLista = "User:HAndrade (WMF)/Testes/DAB";

  glwiki.chamadaAPI = "http://pt.wikipedia.org/w/api.php?format=json&action=query&prop=revisions&rvprop=content&callback=?&titles=";


  //-- Mecanismo ---

  glwiki.criaLinks = function criaLinks(palavrasChave, palavrasLink){
    var totalDeSeletores = glwiki.seletorTags.length;

    palavras = palavrasChave.length;

    for(var x = 0; x < totalDeSeletores; x++){
      // pega as tags com o seletor
      var tags = $(glwiki.seletorTags[x]);

      // se não tem tag então pula para o proxímo seletor
      if(!tags) continue;

      // para cada tag encontrada ...
      tags.each(function(){
        var tag = $(this);
        // pega o nome da tag para checar se está na lista de tags permitidas
        var tagName = tag.prop("tagName");

        // só adiciona o link para as tags permitidas
        if(glwiki.tagPermitida(tagName)){
          //busca pelos termos dentro do html
          texto = tag.html();
          for(var k = 0; k < palavras; k++){
            // formata a palavra chave transformando em link
            var tagLink = glwiki.formatarTagDoLink(palavrasChave[k], palavrasLink[k]);
            // troca o texto encontrado pela tag
            texto = texto.replace(new RegExp(palavrasLink[k],"g"), tagLink);
          } // fecha for conteudo

          tag.html(texto);
        }
      });

    } // fecha for blocos
  };

  /**
   * Formata uma tag de link com a palavra chave e texto do link informados
   * @param  {string} palavraChave  palavra chave
   * @param  {string} texto   texto para adicionar dentro do link
   * @return {string}              texto da tag link
   */
  glwiki.formatarTagDoLink = function formatarTagDoLink(palavraChave, texto){
    var link = "http://pt.wikipedia.org/wiki/"+palavraChave;
    return "<a class='"+glwiki.linkClass+"' href='"+link+"'>"+texto+"</a>";
  };

  /**
   * Pega a lista de palavras de uma página na wikipedia
   * ao terminar executa o callback passando uma lista de palavras
   * @param {string callback   callback(palavras);
   * @return {void}
   */
  glwiki.getPalavras = function getPalavras(callback){
    $.ajax({
      type: "GET",
      url: glwiki.chamadaAPI + glwiki.enderecoLista,
      contentType: "application/json; charset=utf-8",
      async: false,
      dataType: "json",
      success: function (data, textStatus, jqXHR) {
        var pageId = Object.keys(data.query.pages);
        texto = data.query.pages[pageId].revisions[0]["*"];
        texto = texto.replace(/(\r\n|\n|\r)/gm,"");
        var palavras = texto.match(/==\sPalavras.*==\sBlocos\sde\sConteúdo/g);
        palavras = palavras[0].match(/\[\[.*?\]\]/g);
        for(i=0;i<palavras.length;i++){
          palavras[i] = palavras[i].replace(new RegExp("\\[\\[","g"), "");
        }
        for(i=0;i<palavras.length;i++){
          palavras[i] = palavras[i].replace(new RegExp("\\]\\]","g"), "");
        }

        // salva as palavras no glwiki
        glwiki.palavras = palavras;
        // roda o callback passando as palavras
        callback(palavras);
      },
      error: function (errorMessage) {
        console.error(errorMessage);
      }
    });
  };

  // flag para marcar se o glwiki iniciou
  glwiki.iniciou = false;
  /**
   * Função para iniciar o script
   */
  glwiki.init = function init(){
    // só permite que o glwiki inicie 1 vez
    if(glwiki.iniciou) return;
    glwiki.iniciou = true;

    // carrega as palavas da wiki
    glwiki.getPalavras(function(palavras){
      var palavrasLink = new Array();
      for(i=0;i<palavras.length;i++){
        if (palavras[i].match(/\|/)){
          palavrasLink[i] = palavras[i].replace(new RegExp("^.*?\\|"), "");
          palavras[i] = palavras[i].replace(new RegExp("\\|.*?$"), "");
        }else{
          palavrasLink[i] = palavras[i];
        }
      }

      glwiki.criaLinks(palavras,palavrasLink);

    });
  };


  // ---- HELPERS ---- //
  /**
   * Verifica se a tag é permitida - se está na lista de tags permitidas
   * @param  {string}  tag
   * @return {boolean}  retorna verdadeiro ou falso
   */
  glwiki.tagPermitida = function tagPermitida(tag){
    return $.inArray(tag.toLowerCase(), glwiki.tagsPermitidas) > -1;
  };


  $(document).ready(function(){
    // se inicioAutomatico estiver ativado inicia o script marcando as tags
    if(glwiki.inicioAutomatico){
      glwiki.init();
    }
  });

  // exportando para o contexto global do navegador
  window.glwiki = glwiki;

})(jQuery);
