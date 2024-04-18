
<%
'on error resume next

'' Response.CharSet = "ISO-8859-1"
'' Response.CodePage = 28591

session.lcid=1046
Set  banco = Server.CreateObject("ADODB.Connection")
banco.ConnectionTimeout = 120
with banco


  .connectionString = "Provider=SQLOLEDB;DRIVER={System.Data.SqlClient.SqlConnection};SERVER=localhost\SQLEXPRESS;UID=brenom;Password=14122002;DATABASE=base_TCC"  

     .Open
     
end with
%>
