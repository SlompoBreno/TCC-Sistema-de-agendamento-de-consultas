<%@LANGUAGE="VBSCRIPT" CODEPAGE="65001"%>
<!--#include file="arquivos.asp"-->
<!--#include file="JSON_2.0.4.asp" -->
<!--#include file="JSON_UTIL_0.1.1.asp" -->
<!--#include file="validacao.asp" -->

<%

Dim d 
set d = ConverteRequestParaDicionario(Request)

if d.item("a") = "verificaLogin" then
    VerificaLogin
end if    

sub VerificaLogin
    ' Pegar os dados do formulário
    Dim cpf, senha
    cpf = d.item("cpf")
    senha = d.item("senha")

    ' Consulta SQL para verificar as credenciais (com comparação case-sensitive)
    Dim sqlVerificaCredenciais
    sqlVerificaCredenciais = "SELECT CPF FROM Pacientes WHERE CPF = '" & cpf & "' AND Senha = '" & senha & "' COLLATE SQL_Latin1_General_CP1_CS_AS"

    ' Execute a consulta
    Dim rsVerificaCredenciais
    Set rsVerificaCredenciais = banco.Execute(sqlVerificaCredenciais)

    If Not rsVerificaCredenciais.EOF Then
        ' As credenciais são válidas
        ' Você pode optar por redirecionar para outra página se necessário
        Response.Write "OK"
    Else
        ' As credenciais são inválidas
        Response.Write "CREDENCIAIS_INVALIDAS"
    End If

    ' Fechar o conjunto de resultados
    rsVerificaCredenciais.Close
end sub

%>
