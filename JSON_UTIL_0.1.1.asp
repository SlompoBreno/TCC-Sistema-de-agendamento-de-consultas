<%
Dim rsQueryToJSON
Function QueryToJSON(dbc, sql)
        Dim jsa
        Set rsQueryToJSON = dbc.Execute(sql)
        Set jsa = jsArray()
        While Not (rsQueryToJSON.EOF Or rsQueryToJSON.BOF)
                Set jsa(Null) = jsObject()
                For Each col In rsQueryToJSON.Fields
                        jsa(Null)(col.Name) = col.Value
                Next
        rsQueryToJSON.MoveNext
        Wend
        Set QueryToJSON = jsa
End Function
%>