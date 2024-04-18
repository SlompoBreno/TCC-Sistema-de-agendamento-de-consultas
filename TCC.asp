<%@LANGUAGE="VBSCRIPT" CODEPAGE="65001"%>



<!--#include file="arquivos.asp"-->
<!--#include file="JSON_2.0.4.asp" -->
<!--#include file="JSON_UTIL_0.1.1.asp" -->
<!--#include file="validacao.asp" -->

<%

Dim d 

set d = ConverteRequestParaDicionario(Request)

if d.item("a") = "tabela" then
	Tabela
elseif d.item("a") = "cadastrarPaciente" then
	cadastrarPaciente
elseif d.item("a") = "pesquisarPaciente" then
	PesquisarPaciente
elseif d.item("a") = "carregaArea" then
	CarregaArea
elseif d.item("a") = "carregaMedico" then
	CarregaMedico	
elseif d.item("a") = "carregaHora" then
	CarregaHora	
elseif d.item("a") = "agendarConsulta" then
	AgendarConsulta
elseif d.item("a") = "excluiConsulta" then
	ExcluiConsulta				
end if

sub Tabela
    sql = "SELECT " & _
        "Consultas.chConsulta, " & _
        "Pacientes.Nome AS NomePaciente, " & _
        "Pacientes.CPF, " & _
        "Medicos.Nome AS NomeMedico, " & _
        "areaMedico.Descricao AS DescricaoArea, " & _
        "Consultas.Data, " & _
        "Consultas.Hora " & _
        "FROM  " & _
        "Consultas " & _
        "INNER JOIN " & _
        "Pacientes ON Consultas.chPaciente = Pacientes.chPaciente " & _
        "INNER JOIN " & _
        "Medicos ON Consultas.chMedico = Medicos.chMedico " & _
        "INNER JOIN " & _
        "areaMedico ON Consultas.chArea = areaMedico.chArea " & _
        "WHERE dataHoraExclusao IS NULL AND Pacientes.CPF = '" & d.item("cpf") & "'" & _
        "ORDER BY Consultas.Data"

    QueryToJSON(banco, sql).Flush
    response.end
end sub


Sub cadastrarPaciente()
    Dim cpfExistente
    cpfExistente = False


    Dim sqlVerificaCPF
    sqlVerificaCPF = "SELECT COUNT(*) FROM Pacientes WHERE CPF = '" & d.item("cpf") & "'"

    Dim rsVerificaCPF
    Set rsVerificaCPF = banco.Execute(sqlVerificaCPF)

    If Not rsVerificaCPF.EOF Then
        If rsVerificaCPF(0) > 0 Then
            ' O CPF já existe no banco
            cpfExistente = True
        End If
    End If

    rsVerificaCPF.Close

    If cpfExistente Then
        ' CPF já existe, envie uma resposta indicando que houve um problema
        Response.Write "CPF_EXISTENTE"
        Exit Sub
    End If

    ' Se chegou até aqui, o CPF não existe, então podemos realizar a inserção
    Dim sqlInserirPaciente
    sqlInserirPaciente = "INSERT INTO Pacientes (Nome, CPF, dataNascimento, Sexo, Telefone, Email, Senha) " & _
          "VALUES ('" & d.item("nome") & "', " & _
          "'" & d.item("cpf") & "', " & _
          "'" & d.item("nascimento") & "', " & _
          "'" & d.item("sexo") & "', " & _
          "'" & d.item("telefone") & "', " & _
          "'" & d.item("email") & "', " & _
          "'" & d.item("senha") & "') "

    banco.execute(sqlInserirPaciente)

    Response.Write "OK"
End Sub


sub PesquisarPaciente

    sql = "SELECT Nome FROM Pacientes WHERE cpf = '" & d.item("cpfConsulta") & "'"

    QueryToJSON(banco, sql).Flush
    response.end
end sub


sub CarregaArea

	sql = "select chArea, descricao from areaMedico order by descricao"
	QueryToJSON(banco, sql).Flush
	response.end 

end sub

sub CarregaMedico

	sql = "select chMedico, Nome, CRM " & _
	"from Medicos " & _
	"where chArea = " & d.item("chArea") & _
	"order by Nome"

	QueryToJSON(banco, sql).Flush
	response.end

end sub


sub CarregaHora

    Dim cpfConsulta
    cpfConsulta = d.item("cpf")

    ' Verifica se o CPF existe na tabela Pacientes
    Dim chPaciente
    chPaciente = ObterChPaciente(cpfConsulta)

    Dim data, chMedico
    data = Request("data")
    chMedico = Request("chMedico")

    ' Consulta SQL para verificar a disponibilidade
    sql = "SELECT Hora FROM Consultas WHERE Data = '" & data & "' AND (chMedico = " & chMedico & " OR chPaciente = " & chPaciente &")  AND dataHoraExclusao is NULL"

    ' Execute a consulta
    Set rs = banco.Execute(sql)

    ' Crie uma lista para armazenar os horários ocupados
    Dim horariosOcupados
    horariosOcupados = ""

    ' Verifique se há registros antes de iterar
    If Not rs.EOF Then
        ' Itera através dos registros para obter os horários ocupados
        Do While Not rs.EOF
            horariosOcupados = horariosOcupados & rs("Hora") & ","
            rs.MoveNext
        Loop

        ' Remova a vírgula extra no final da lista
        If Len(horariosOcupados) > 0 Then
            horariosOcupados = Left(horariosOcupados, Len(horariosOcupados) - 1)
        End If
    End If

    ' Escreva a lista de horários ocupados para o JS
    Response.Write horariosOcupados
end sub

Sub AgendarConsulta
    Dim cpfConsulta
    cpfConsulta = d.item("cpf")

    ' Verifica se o CPF existe na tabela Pacientes
    Dim chPaciente
    chPaciente = ObterChPaciente(cpfConsulta)

    If chPaciente <> "" Then
        ' O CPF existe, então podemos prosseguir com o agendamento
        Dim sqlAgendarConsulta
        sqlAgendarConsulta = "INSERT INTO Consultas (chPaciente, chArea, chMedico, Data, Hora) " & _
                             "VALUES ('" & chPaciente & "', '" & d.item("area") & "', '" & d.item("medico") & "', '" & d.item("data") & "', '" & d.item("hora") & "')"

        banco.execute(sqlAgendarConsulta)

        Response.Write "OK"
    Else
        ' CPF não encontrado, envie uma resposta indicando que houve um problema
        Response.Write "CPF_NAO_EXISTE"
    End If
End Sub

Function ObterChPaciente(cpf)
    ' Consulta SQL para obter chPaciente pelo CPF
    Dim sqlObterChPaciente
    sqlObterChPaciente = "SELECT chPaciente FROM Pacientes WHERE CPF = '" & cpf & "'"

    ' Execute a consulta
    Dim rsObterChPaciente
    Set rsObterChPaciente = banco.Execute(sqlObterChPaciente)

    If Not rsObterChPaciente.EOF Then
        ' Retorna o chPaciente se encontrado
        ObterChPaciente = rsObterChPaciente("chPaciente")
    Else
        ' Retorna uma string vazia se o CPF não foi encontrado
        ObterChPaciente = ""
    End If

    rsObterChPaciente.Close
End Function


sub ExcluiConsulta

		sql = "update Consultas set dataHoraExclusao = getdate() where chConsulta = " & d.item("chConsulta")

    banco.execute(sql)

    response.write "OK"

end sub

%>