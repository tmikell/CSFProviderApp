var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
        loginForm();
        registerForm();
        benefitsForm();
        clickEvents();
        
    },
    // Bind Event Listeners
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        window.addEventListener('popstate', this.onPopState);
    },
    // deviceready Event Handler
    onDeviceReady: function() {
        app.receivedEvent('deviceready');

    },
    onPopState: function(e) {
      //handles what to do when the back button is pressed
      //console.log("popped state: " + e.name);
      // e.state is equal to the data-attribute of the last image we clicked
      //console.log(e.state);
      if(e.state) {
        $("#member-container").html(e.state);
        //need to rebind events and handlers after reloading html
        clickEvents();
        benefitsForm();
        history.replaceState(null, null, null); //remove history as you back over it?
      }
      else {
        history.replaceState(null, null, null); //remove history as you back over it?
        console.log("ERROR: popstate received but nothing stored in e.state ")
      }

    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

function addHistory(name){
  //console.log('pushed state: ' + name);
  history.pushState($("#member-container").html(), name, null);
}

function clickEvents(){
  $('#login-form-link').click(function(e) {
    $("#login-form").delay(100).fadeIn(100);
    $("#register-form").fadeOut(100);
    $('#register-form-link').removeClass('active');
    $(this).addClass('active');
    e.preventDefault();
  });

  $('#register-form-link').click(function(e) {
    $("#register-form").delay(100).fadeIn(100);
    $("#login-form").fadeOut(100);
    $('#login-form-link').removeClass('active');
    $(this).addClass('active');
    e.preventDefault();
  });


  $('#benefits-form-link').click(function(e) {
    $("#member-nav").removeClass("in"); //added 3/26 to collapse the menu after click
    $(".member-data").fadeOut(100);
    $('#member-nav li').removeClass('active');
    $(this).addClass('active');
      benefitsForm();
      "clicked on benefits form"
    $("#benefits-form-div").delay(100).fadeIn(100, function(){
      addHistory('Search Form');
    });

    e.preventDefault();
  });

  $('#profile-link').click(function(e) {
    $(".member-data").fadeOut(100);
    $('#member-nav li').removeClass('active');
    $(this).addClass('active');
    var stringCurrentUser = localStorage.currentUser;
    var currentUser = JSON.parse(stringCurrentUser);
    document.getElementById("user-name").innerHTML = currentUser["Username"];
    $("#profile").delay(100).fadeIn(100, function(){
      addHistory('User Profile');
    });
    e.preventDefault();
  });


  $('#filing-link').click(function(e) {
    $("#member-nav").removeClass("in"); //added 3/26 to collapse the menu after click
    $(".member-data").fadeOut(100);
    $('#member-nav li').removeClass('active');
    $(this).addClass('active');
    $("#filing-info").delay(100).fadeIn(100, function(){
      addHistory('Filing Info');
    });
    e.preventDefault();
  });

$("#logout").click(function(){
  localStorage.login="false";
  localStorage.clear();
  window.location.href = "index.html";
});
}


function loginForm(){
  //validation rules
  $("#login-form").validate({
      rules: {
          "Username": {
              required: true

          },
          "Password": {
              required: true
          }
      },
      //perform an AJAX post to API
      submitHandler: function (form) {
          var formdata = $(form).serializeArray();
          var currentUser = {};

          $(formdata).each(function(index, obj){
            currentUser[obj.name] = obj.value
          });

          $.ajax({
              type: "POST",
              url: "https://myteamcare.org/ics.ashx",
              data: $(form).serialize(),
              headers: {
                  "action": 'authenticate',
                  "Content-type": "application/x-www-form-urlencoded",
              },
              success: function (message) {

                  if (message.Success) {
                   window.location = 'memberdata.html';
                    //console.log(message);

                    // Put the object and login state into storage
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));

                    localStorage.login="true";
                  }


                  else {
                      alert(message.Error);
                      window.localStorage.clear();

                  }
                  //window.location = 'memberdata.html';
              },
              error: function () { alert("There was an error communicating with the server.  Please try again")}
          });
          return false; // required to block normal submit since you used ajax
      }
  });
};

function registerForm(){
    //validation rules
$("#register-form").validate({
      rules: {
          "Username": {
              required: true,
              rangelength: [8, 30],
              uppercase: true,
              lowercase: true,
              number: true

          },
          "Password": {
              required: true
          }
          ,
          "TaxId": {
              required: true,
              taxid: true
          }
          ,
          "FirstName": {
              required: true
          }
          ,
          "LastName": {
              required: true
          }
          ,
          "Email": {
              required: true,
              email: true
          }
          ,
          "Question1": {
              required: true
          }
          ,
          "Answer1": {
              required: true
          }
          ,
          "Question2": {
              required: true
          }
          ,
          "Answer2": {
              required: true
          }
          ,
          "Question3": {
              required: true
          }
          ,
          "Answer3": {
              required: true
          }
      },
      //perform an AJAX post to API
      submitHandler: function (form) {
          jQuery(form).ajaxSubmit({
              type: "POST",
              url: "https://myteamcare.org/ics.ashx",
              data: $(this).serialize(),
              headers: {
                  "action": 'register',
                  "Content-type": "application/x-www-form-urlencoded",
              },
              success: function (data) {
                  //console.log(data);
                  alert("Registration successful. Check email for next steps");

                  window.location = 'memberdata.html';
              },
              error: function () { alert("There was an error") }
          });

      }
  });
};

function benefitsForm(){
  // validation rules
  $("#benefits-form").validate({
      rules: {
          "Patient Birthdate": {
              required: true

          },
          "Patient Member ID": {
              required: true
          }
      }
  });

  //perform an AJAX post to API
  $("#benefits-form").submit(function(event){
    addHistory('Search Form with Values');
    event.preventDefault();
    console.log('search submitted');
    if ($("#benefits-form").valid()){
        // Retrieve the current user object from storage and convert to JSON format needed for HTTP "check" call
        var stringCurrentUser = localStorage.currentUser;
        var currentUser = JSON.parse(stringCurrentUser);
        var formDataJSON = {}; //reset
        formDataJSON = {
          "Username" : currentUser["Username"],
          "Password": currentUser["Password"],
        }

        // Generate benefits form data as array and add to JSON
        var formData = $("#benefits-form").serializeArray();
        $(formData).each(function(index, obj){
            formDataJSON[obj.name] = obj.value
            console.log('formdatajson: ' + obj.name);

          });

      $.ajax({
          type: "POST",
          url: "https://myteamcare.org/ics.ashx",
          data: formDataJSON,
          headers: {
            "action": 'check',
            "Content-type": "application/x-www-form-urlencoded"
          },

          success: function (message) {
            if(message["Error"]){
              alert(message["Error"])
            }else{
              //console.log("success message:" + message);
               displayBenefits(message);
              $(".member-data").fadeOut(100);
  
              //location.hash = "searchresults";
              $("#benefits-result").delay(100).fadeIn(100, function(){
                addHistory('Benefits');
              });
            }
          },

          error: function (message) {
           alert("The member record could not be found or there was an error communicating with the server.  Please try again")
        }
      });
        return false;
    }
  });
};

// Fills in member health information to DOM
function displayBenefits(memberDataJSON){

  $.each(memberDataJSON, function(key, value){
      if ($("#" + key).length > 0){
        if (key=='PatientBirthDate'){
          //crop out the long date format - this is a hack and should be fixed server side on the db query result- javascript has no good date formatting options without adding modules
          value = value.substring(0, 10);
        }
        $("#" + key).html(value);
      }
    })

  // Add and format PDF links - TODO add external link test for android/ios separately
  $.each(memberDataJSON["PlanDocuments"], function(index, obj){
    var displayNameClean =  obj["DisplayName"].replace(/[^\w]/gi, '')

    if($("#" + displayNameClean).length > 0){
        var url = "http://docs.google.com/viewer?url="+ "https://myteamcare.org/" + obj["RelativePath"] + '&embedded=true';

      // ON CLICK
        $("#" + displayNameClean).click(function(e){
            e.preventDefault();
              if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|IEMobile)/)) {
            //use cordova inAppBrowser
                  var ref = window.open(url, '_blank', 'hidden: no', 'toolbar=yes', 'EnableViewportScale=yes', 'location=yes');

                  ref.addEventListener('loadstart', function (event) { alert('start: ' + event.url); }); //starts to load a URL.
                  ref.addEventListener('loadstop', function (event) { alert('stop: ' + event.url); }); //finishes loading a URL.
                  ref.addEventListener('loaderror', function (event) { alert('error: ' + event.message); }); //encounters an error when loading a URL.
                  ref.addEventListener('exit', function (event) { alert(event.type); }); //window is closed.
                  window.new_window.addEventListener("exit", function () { window.new_window.close(); });
          } else {
          //for non mobile device open browser
                window.open(url);
          }
      });

    };
  })
};

// PDF NOTES

       // In iOS all three code snippets below displays the same thing: you can see PDF but its full screen and there no back button. You have to close and restart app to get out.
              //  window.open(url, '_system', 'location=yes');
             // $("#" + displayNameClean).attr("href", url)
            // window.open(url, '_blank', 'hidden: no', 'toolbar=yes', 'EnableViewportScale=yes', 'location=yes');