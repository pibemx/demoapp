const host = 'http://45.55.35.73:3001'
var app = {}

$('#logout').click(function(){
    localStorage.removeItem('user-token')
    $.ajax({
        url: host + '/sessions',
        method: "DELETE",
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Auth " + app.userToken)
        },
        success: function (data) {
            window.location.reload()
        },
        error: function (jqXHR, textStatus, errorThrown) { 
            window.location.reload()
        }
    });
})

var loadContacts = function(){
    $.ajax({
        url: host + '/contact',
        method: "GET",
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Auth " + app.userToken)
        },
        success: function (data) {
            app.contacts = data
            drawContacts()
        },
        error: function (jqXHR, textStatus, errorThrown) {
            localStorage.removeItem('user-token')
            window.location.reload()
        }
    });
}

var drawContacts = function(){
    html = ""
    if(Object.keys(app.contacts).length == 0)
        html = "<p>No hay contactos para mostrar.</p>"
    else {
        var tmpl = $('#contact-item-tmpl').html()
        for(key in app.contacts){
            var name = app.contacts[key]['name'] || ''
            var lastname = app.contacts[key]['lastname'] || ''
            var phone = app.contacts[key]['phone'] || ''
            var address = app.contacts[key]['address'] || ''
            var social = app.contacts[key]['social'] || ''

            var htmlitem = tmpl.split('{{name}}').join(name)
            htmlitem = htmlitem.split('{{lastname}}').join(lastname)
            htmlitem = htmlitem.split('{{phone}}').join(phone)
            htmlitem = htmlitem.split('{{address}}').join(address)
            htmlitem = htmlitem.split('{{social}}').join(social)
            html += htmlitem
        }
    }
    $('#contacts-container').html(html)
}

$('#show-contact-form').click(function(){
    $('#addContactModal').modal('show')
})

$('#add-contact-btn').click(function(){
    var contact = {
        name: $('#name').val(),
        lastname: $('#lastname').val(),
        phone: $('#phone').val(),
        address: $('#address').val(),
        social: $('#social').val()
    }

    $('#name').val('')
    $('#lastname').val('')
    $('#phone').val('')
    $('#address').val('')
    $('#social').val('')

    $('#addContactModal').modal('hide')

    console.log(contact)

    $.ajax({
        url: host + '/contact',
        method: "POST",
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Auth " + app.userToken)
        },
        dataType: 'json',
        data: contact,
        success: function (data) {
            loadContacts()
        },
        error: function (jqXHR, textStatus, errorThrown) {
            localStorage.removeItem('user-token')
            window.location.reload()
        }
    });
})

$('.btn-login').click(function(){
  var username = $('#email').val()
  var password = $('#password').val()

  $.post(host + '/sessions', {username: username, password: password}, function(response){
    localStorage['user-token'] = response
    window.location.reload()
  })

})

$(document).ready(function(){
  app = {
    userToken: localStorage['user-token'] || undefined
  }

  if(app.userToken === undefined){
    openLoginModal()
  }else{
    //Validar sesión
    $.ajax({
        url: host + '/sessions',
        method: "GET",
        beforeSend: function (xhr) {
	    xhr.setRequestHeader("Authorization", "Auth " + app.userToken)
        },
        success: function (data) {
	    loadContacts()
        },
        error: function (jqXHR, textStatus, errorThrown) {
            localStorage.removeItem('user-token')
	    window.location.reload()
        }
    });
  }
})
