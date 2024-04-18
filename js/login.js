$(document).ready(function () {

});

function Entrar() {
  var dadosLogin = {
    cpf: $("#cpf").val(),
    senha: $("#senha").val()
  };

  $.post('login.asp?a=verificaLogin', dadosLogin, function (retorno) {
    if (retorno === "OK") {
        // Redirecionar para TCC.htm incluindo o CPF na URL
        var cpf = $("#cpf").val();
        window.location.href = 'TCC.htm?cpf=' + cpf;
    } else  {
        alert("Credenciais incorretas.");
    }
  });
}
