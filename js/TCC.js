$(document).ready(function () {

    $('#cpf').inputmask('999.999.999-99');
    $('#dataNascimento').inputmask('99/99/9999');
    $('#telefone').inputmask('(99) 9999-9999[9]');
    tabela();
    CarregaArea();
    PesquisarPaciente();

        function aplicarFiltro() {
            var termoFiltro = $("#filtroGeral").val().toLowerCase();

            $("#tbody tr").each(function () {
                var linha = $(this).text().toLowerCase();

                // Verifica se a linha contém o termo de filtro
                var atendeFiltro = linha.indexOf(termoFiltro) !== -1;

                // Exibe ou oculta a linha com base no filtro
                if (atendeFiltro) {
                    $(this).show();
                } else {
                    $(this).hide();
                }
            });
        }

        // Associar evento de input ao campo de filtro
        $("#filtroGeral").on("input", function () {
            aplicarFiltro();
        });

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
  };

  $.post('TCC.asp?a=cadastrarPaciente', dadosPaciente, function (retorno) {
    if (retorno === "OK") {
        alert("Paciente cadastrado com sucesso");
    } else if (retorno === "CPF_EXISTENTE") {
        alert("CPF já cadastrado. Verifique os dados informados.");
    }
  });
}


function PesquisarPaciente() {
    // Obtenha o CPF da URL
    var urlParams = new URLSearchParams(window.location.search);
    var cpfConsulta = urlParams.get('cpf');

    var nomePaciente = "";

    $.get('TCC.asp?a=pesquisarPaciente&cpfConsulta=' + cpfConsulta, function (retorno) {
        if (Array.isArray(retorno) && retorno.length > 0 && retorno[0].Nome !== undefined) {
            // Atualiza o campo nomePaciente com o nome retornado
            nomePaciente = retorno[0].Nome;
            $('#nomePaciente').val(nomePaciente);
        } else {
            $('#nomePaciente').val('');
            $('#nomePaciente').val('Paciente não cadastrado');
        }
    }, "JSON");
}



function CarregaArea(){

  $.get('TCC.asp?a=carregaArea', function(retorno){ 
    var html = '<option value="">Selecione a área de atendimento</option>';
    $.each(retorno, function(index, area){
      html += '<option value="' + area.chArea + '">' + area.descricao + '</option>';
    });
    $("#area").html(html); 
  },"JSON");

}


function CarregaMedico(){

  var area = $('#area').val();
  $.get('TCC.asp?a=carregaMedico&chArea='+ area, function(retorno){ 
    var html = '<option value="">Selecione</option>';
    $.each(retorno, function(index, medico){
      html += '<option value="' + medico.chMedico + '">' + medico.Nome + '</option>';
    });
    $("#medico").html(html); 
  },"JSON");

}


function zeroFill(number) {
    return number < 10 ? '0' + number : number;
}

function CarregaData() {
    var html = '<option value="">Selecione</option>';
    var $select = $('#data');
    var currentDate = new Date();
    var nextMonthDate = new Date();
    nextMonthDate.setMonth(currentDate.getMonth() + 1);

    while (currentDate <= nextMonthDate) {
        // Verifica se o dia da semana é de segunda a sexta-feira (0 a 4)
        if (currentDate.getDay() >= 1 && currentDate.getDay() <= 5) {
            var formattedDate = zeroFill(currentDate.getDate()) + '/' + zeroFill(currentDate.getMonth() + 1) + '/' + currentDate.getFullYear();

            html += '<option value="' + formattedDate + '">' + formattedDate + '</option>';

            $("#data").html(html);


        }

        currentDate.setDate(currentDate.getDate() + 1);
    }
}


function CarregaHora() {
    var select = $('#hora');
    var data = $('#data').val();
    var chMedico = $('#medico').val();
    var urlParams = new URLSearchParams(window.location.search);
    var cpf = urlParams.get('cpf');

    select.empty();

    $.get('TCC.asp?a=carregaHora&data=' + data + '&chMedico=' + chMedico + '&cpf=' + cpf, function (horariosOcupados) {
        for (var hour = 9; hour < 18; hour++) {
            for (var minute = 0; minute < 60; minute += 30) {
                var formattedHour = (hour < 10) ? '0' + hour : hour;
                var formattedMinute = (minute === 0) ? '00' : minute;
                var time = formattedHour + ':' + formattedMinute;

                // Verifica se o horário está ocupado antes de adicioná-lo à lista
                if (!horariosOcupados.includes(time)) {
                    var option = $('<option>').val(time).text(time);
                    select.append(option);
                }
            }
        }
    });
}


function AgendarConsulta() {
  if (ValidarConsulta() != "") {
    alert("Foram encontrados os seguintes erros:\n" + msg);
    msg = "";
    return;
  }

    var urlParams = new URLSearchParams(window.location.search);
    var cpf = urlParams.get('cpf');

  var dadosConsulta = {
    cpf: cpf,
    area: $("#area").val(),
    medico: $("#medico").val(),
    data: $("#data").val(),
    hora: $("#hora").val(),
  };

  $.post('TCC.asp?a=agendarConsulta', dadosConsulta, function (retorno) {
    if (retorno == "OK") {
      alert("Consulta agendada com sucesso");
      tabela();
    } else if (retorno == "CPF_NAO_EXISTE") {
      alert("CPF não encontrado. Verifique os dados informados.");
    }
  });
  CarregaHora();
}


function tabela() {
  var htmlLinha = [];

  var urlParams = new URLSearchParams(window.location.search);
  var cpf = urlParams.get('cpf');

  $.get('TCC.asp?a=tabela&cpf='+ cpf, function (retorno) {
    var dataAtual = new Date();

    $.each(retorno, function (index, consulta) {
      var parts = consulta.Data.split("/");
      var dataConsulta = new Date(parts[2], parts[1] - 1, parts[0], consulta.Hora.split(":")[0], consulta.Hora.split(":")[1]);

      // Verifica se a data da consulta é maior ou igual à data atual
      if (dataConsulta >= dataAtual || dataConsulta.toDateString() === dataAtual.toDateString()) {
        htmlLinha += "<tr>" +
          "<td class='text-center'>" + consulta.NomePaciente + " / " + consulta.CPF + "</td>" +
          "<td class='text-center'>" + consulta.NomeMedico + "</td>" +
          "<td class='text-center'>" + consulta.DescricaoArea + "</td>" +
          "<td class='text-center'>" + consulta.Data + " às " + consulta.Hora + "</td>" +
          '<td class="text-center"><button type="button" id="exclui" class="btn btn-primary" onclick="ConfirmaExcluir(' + consulta.chConsulta + ')" >Excluir</button></td>' +
          "</tr>";
      }
    });

    $("#tbody").html(htmlLinha);

  }, "JSON");
}


function ConfirmaExcluir(chConsulta){
  var retorno = confirm("Deseja excluir essa consulta?");
  if (retorno == true){
      Excluir(chConsulta);
  }
  
};

function Excluir(chConsulta){

    $.get('TCC.asp?a=excluiConsulta&chConsulta=' + chConsulta, function(retorno) {
        if(retorno == "OK"){
           tabela();
           alert("Consulta excluída com sucesso");
        }
    });
};

var msg = "";

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

function ValidarConsulta() {
    if ($("#nomePaciente").val() == "Paciente não cadastrado") {
        msg = "Paciente não cadastrado no sistema.\n";
    } 

    if ($("#nomePaciente").val() == "") {
        msg = "Informe o cpf e pesquise para verificação do paciente no sistema.\n";
    } 

    if ($("#area").val() == "") {
        msg += "Área de atendimento não informada.\n";
    }

    if ($("#medico").val() == "") {
        msg += "Médico não informado.\n";
    }

    if ($("#data").val() == "") {
        msg += "Data não informada.\n";
    }

    if ($("#hora").val() == "") {
        msg += "Hora não informada.\n";
    }

    return msg;
}
