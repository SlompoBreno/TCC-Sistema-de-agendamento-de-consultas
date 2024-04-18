
<%

'BIBLIOTECA DE FUNCOES DE VALIDACAO'

'FUNCAO QUE FILTRA CARACTERES MALICIOSOS'
'-------------------------------------'
function SafeVariavelSql(valor)
'-------------------------------------'
    if valor <> "" then
          'SUBSTITUICAO DE CARACTERES/PALAVRAS PROIBIDAS'
          valor = Replace(valor,"'","`")
          valor = Replace(valor, "|", "!")
          valor = Replace(valor, "--", "..")
          valor = Replace(valor, "/*", "")
          valor = Replace(valor, "*/", "")
          valor = Replace(valor, "@@", "@-@")
          valor = Replace(valor, """""", "``")
          valor = Replace(valor, "sysobjects", "", 1, -1, 1)   'case insensitive'
          valor = Replace(valor, "syscolumns", "", 1, -1, 1)
          valor = Replace(valor, "sysdatabases", "", 1, -1, 1)
          valor = Replace(valor, "execute ", "executa ", 1, -1, 1)
          valor = Replace(valor, "exec ", "executa ", 1, -1, 1)
          valor = Replace(valor, "create ", "criar ", 1, -1, 1)
          valor = Replace(valor, "alter table", "alterar ", 1, -1, 1)
          valor = Replace(valor, "drop ", "excluir ", 1, -1, 1)
          valor = Replace(valor, "insert ", "insere ", 1, -1, 1)
          valor = Replace(valor, "update ", "atualiza ", 1, -1, 1)
          valor = Replace(valor, "table ", "tabela ", 1, -1, 1)
          valor = Replace(valor, "xp_ ", "", 1, -1, 1)
          valor = Replace(valor, "begin ", "iniciar", 1, -1, 1)
    end if

    SafeVariavelSql = valor

end function



'CONVERTE O ARRAY REQUEST EM UM DICIONARIO COM OS DADOS FILTRADOS DE CARACTER MALICIOSO'
'-----------------------------------------------'
function ConverteRequestParaDicionario(requestObj)
'-----------------------------------------------'
	Dim d, item, fieldName, fieldValue
	Set d = Server.CreateObject("Scripting.Dictionary")

	For Each item In requestObj.Form
	    fieldName = item
	    fieldValue = SafeVariavelSql(requestObj.Form(Item))
  
	    d.Add fieldName, fieldValue
	Next 

	For Each item In requestObj.QueryString
	    fieldName = item
	    fieldValue = SafeVariavelSql(requestObj.QueryString(Item))

	    d.Add fieldName, fieldValue
	Next

	set ConverteRequestParaDicionario = d

end function

%>