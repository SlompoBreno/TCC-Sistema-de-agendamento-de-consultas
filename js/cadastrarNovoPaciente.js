$(document).ready(function () {

    $('#cpf').inputmask('999.999.999-99');
    $('#dataNascimento').inputmask('99/99/9999');
    $('#telefone').inputmask('(99) 9999-9999[9]');

});


function CadastrarPaciente() {

  if(ValidarPaciente() != ""){
    alert("Foram encontrados os seguintes erros:\n" + msg);
    msg = "";
    return;
  }

  var dadosPaciente = {
    nome: $("#nomeCompleto").val(),    
    cpf: $("#cpf").val().replace(/\D/g, ''),
    nascimento: $("#dataNascimento").val(),
    sexo: $("#sexo").val(),
    telefone: $("#telefone").val().replace(/\D/g, ''),
    email: $("#email").val(),
    senha: $("#senha").val() 
  };

  $.post('TCC.asp?a=cadastrarPaciente', dadosPaciente, function (retorno) {
    if (retorno === "OK") {
        alert("Paciente cadastrado com sucesso");
        window.location.href = 'login.htm';
    } else if (retorno === "CPF_EXISTENTE") {
        alert("CPF já cadastrado. Verifique os dados informados.");
    }
  });
}

function ValidarPaciente() {
    if ($("#nomeCompleto").val() == "") {
        msg = "Nome não informado\n";
    } else {
        // Validar pelo menos um sobrenome no nome
        var partesNome = $("#nomeCompleto").val().split(" ");
        if (partesNome.length < 2) {
            msg += "Informe pelo menos um sobrenome no nome\n";
        }
    }

    // Validar CPF
    var cpf = $("#cpf").val().replace(/\D/g, '');
    if (cpf.length !== 11) {
        msg += "CPF inválido\n";
    }

    // Validar data de nascimento
    var dataNascimento = $("#dataNascimento").val();
    if (!isValidDate(dataNascimento)) {
        msg += "Data de Nascimento inválida\n";
    }

    // Validar sexo
    var sexo = $("#sexo").val();
    if (!sexo) {
        msg += "Selecione o sexo\n";
    }

    // Validar telefone
    var telefone = $("#telefone").val().replace(/\D/g, '');
    if (telefone.length !== 11) {
        msg += "Telefone inválido\n";
    }

    // Validar email
    var email = $("#email").val();
    if (!isValidEmail(email)) {
        msg += "E-mail inválido\n";
    }

    // Validar senha
    var senha = $("#senha").val();
    if (senha === "") {
        msg += "Senha não informada\n";
    } else {
        // Verificar se a senha tem pelo menos 8 caracteres
        if (senha.length < 8) {
            msg += "Senha deve ter pelo menos 8 caracteres\n";
        }

        // Verificar se a senha contém pelo menos uma letra maiúscula e um número
        if (!/[A-Z]/.test(senha) || !/\d/.test(senha)) {
            msg += "Senha deve conter pelo menos uma letra maiúscula e um número\n";
        }

        // Verificar se a senha contém espaços em branco
        if (/\s/.test(senha)) {
            msg += "Senha não pode conter espaços em branco\n";
        }
    }

    return msg;
}

function isValidEmail(email) {
    // Utilize uma expressão regular para validar o formato do email
    var regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function isValidDate(dateString) {
    // Utilize uma expressão regular para validar o formato da data (DD/MM/AAAA)
    var regex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!regex.test(dateString)) return false;

    // Verifique se a data é válida (considerando anos bissextos)
    var parts = dateString.split("/");
    var day = parseInt(parts[0], 10);
    var month = parseInt(parts[1], 10);
    var year = parseInt(parts[2], 10);
    var date = new Date(year, month - 1, day);

    return (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
    );
}