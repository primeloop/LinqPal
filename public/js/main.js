let page = ""
var authenticated = false
var guid = Math.random().toString(36).substring(2, 5) + Math.random().toString(36).substring(2, 5);
let timeout = null



$(document).ready(function() {

    "use strict";
    try {
        let app = firebase.app();
    } catch (e) {
        console.error(e);
    }




    //The Next Step Button on Home page
    $(".next_step").on("click", function(e) {
        e.preventDefault();
        let min = parseInt($(this).attr("data-min"));
        let max = parseInt($(this).attr("data-max"));
        let index = parseInt($(this).attr("data-index"));
        if (index < max) {
            index += 1
            $(this).attr("data-index", index);
            $(".prev_step").attr("data-index", index);
            $(".steps").addClass("hidden");
            $("#s" + index).removeClass("hidden");
            ga('send', 'next step button')
        }

    })

    //The Previous Step Button on Home page
    $(".prev_step").on("click", function(e) {
        e.preventDefault();
        let min = parseInt($(this).attr("data-min"));
        let max = parseInt($(this).attr("data-max"));
        let index = parseInt($(this).attr("data-index"));
        if (index > min) {
            index -= 1
            $(this).attr("data-index", index);
            $(".next_step").attr("data-index", index);
            $(".steps").addClass("hidden")
            $("#s" + index).removeClass("hidden");
            ga('send', 'previous step button')
        }

    })




    //The Start-Up -- GET Started
    $(".startup").on("click", function(e) {
        e.preventDefault()
        if (authenticated === true) {
            goto("home")
        } else {
            goto("login")
        }
    })


    //The Login Function
    $(".login").on("click", function(e) {
        e.preventDefault()
        let email = $("#email").val();
        let password = $("#password").val();
        let error = "";

        onLoader()
        if ((/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}/g).test(email) !== true) {
            error += "Please enter a valid email address";
        } else if (password.length < 6) {
            error += "Please enter a valid password";
        }

        if (error == "") {
            firebase.auth().signInWithEmailAndPassword(email, password)
                .then(response => {
                    localStorage.setItem("uid", response.user.uid);
                    swal({
                        title: "Success",
                        text: "Welcome back to LinqPal",
                        icon: "success",
                    })
                    setTimeout(() => goto("home"), 2000);

                })
                .catch(error => {
                    swal({
                        title: "Try Again",
                        text: error.message,
                        icon: "error",
                    })
                    offLoader()
                })
        } else {
            swal("Error Creating Account", error, "error")
            offLoader()
        }
    })


    //The Recover Password Function
    $(".recover").on("click", function(e) {
        e.preventDefault()
        let email = $("#email").val();
        let error = "";

        onLoader()
        if ((/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}/g).test(email) !== true) {
            error += "Please enter a valid email address";
        }

        if (error == "") {
            firebase.auth().sendPasswordResetEmail(email).then(function() {

                    swal({
                        title: "Success",
                        text: "We have sent you a password reset email",
                        icon: "success",
                    })
                    setTimeout(() => goto("index"), 2000);

                })
                .catch(error => {
                    swal({
                        title: "Try Again",
                        text: error.message,
                        icon: "error",
                    })
                    offLoader()
                })
        } else {
            swal("Error Recovering Account", error, "error")
            offLoader()
        }
    })


    //The Sign Up Function
    $(".signup").on("click", function(e) {
        e.preventDefault()
        let email = $("#email").val();
        let password = $("#password").val();
        let firstname = $("#firstname").val();
        let lastname = $("#lastname").val();
        let tele = $("#tele").val();
        let address = $("#address").val();
        let ssn = $("#ssn").val()
        let error = "";

        onLoader()
        if ((/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}/g).test(email) !== true) {
            error += "Please enter a valid email address";
        } else if ((/(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})/).test(tele) === false) {
            error += "Please enter valid USA phone number eg. (000) 000-0000 or 000 000-0000"
        } else if (address.length < 5) {
            error += "Please enter a valid address";
        } else if ((/^([1-9])(?!\1{2}-\1{2}-\1{4})[1-9]{2}-[1-9]{2}-[1-9]{4}/g).test(ssn) !== true) {
            error += "Please enter a valid Social Security Number " + ssn
        } else if (password.length < 6) {
            error += "Please enter a valid password";
        } else if (firstname.length < 3) {
            error += "Please enter a valid first name";
        } else if (lastname.length < 3) {
            error += "Please enter a valid last name";
        }

        if (error == "") {
            let signUp = firebase.functions().httpsCallable("signupUser");
            signUp({
                email,
                password,
                firstname,
                lastname,
                tele,
                address,
                ssn
            }).then(function(r) {
                r = r.data
                if (r.success == 1) {
                    firebase.auth().signInWithEmailAndPassword(email, password)
                        .then(response => {
                            localStorage.setItem("uid", response.user.uid);
                            swal({
                                title: "Good job!",
                                text: "Your account has been created, let's get you in",
                                icon: "success",
                            })
                            setTimeout(() => goto("home"), 2000);

                            offLoader();
                        })
                        .catch(error => {
                            offLoader();
                        })

                } else {
                    swal({
                        title: "Sign-Up Error",
                        text: r.message,
                        icon: "error",
                        button: "Ouch! Re-try",
                    });
                    offLoader();
                }

            })

        } else {
            swal("Error Creating Account", error, "error")
            offLoader();
        }
    })

    //Edit Profile Here
    $(".edit_profile").on("click", function(e) {
        e.preventDefault()
        let firstname = $("#firstname").val();
        let lastname = $("#lastname").val();
        let tele = $("#tele").val();
        let address = $("#address").val();
        let ssn = $("#ssn").val()
        let error = "";

        onLoader()
        if (tele.length < 5) {
            error += "Please enter valid USA phone number eg. (000) 000-0000 or 000 000-0000"
        } else if (address.length < 5) {
            error += "Please enter a valid address";
        } else if ((/^([1-9])(?!\1{2}-\1{2}-\1{4})[1-9]{2}-[1-9]{2}-[1-9]{4}/g).test(ssn) !== true && ssn.length > 0) {
            error += "Please enter a valid Social Security Number " + ssn
        } else if (password.length < 6) {
            error += "Please enter a valid password";
        } else if (firstname.length < 3) {
            error += "Please enter a valid first name";
        } else if (lastname.length < 3) {
            error += "Please enter a valid last name";
        }

        if (error == "") {
            let updateProfile = firebase.functions().httpsCallable("updateProfile");
            updateProfile({
                firstname,
                lastname,
                tele,
                address,
                ssn
            }).then(function(r) {
                r = r.data
                if (r.success == 1) {
                    swal({
                        title: "Good job!",
                        text: "Your account has been updated",
                        icon: "success",
                    })
                    $("#myname").html(firstname + " " + lastname);
                } else {
                    swal({
                        title: "Error",
                        text: r.message,
                        icon: "error",
                        button: "Ouch! Re-try",
                    });
                    offLoader();
                }

            })

        } else {
            swal("Error Creating Account", error, "error")
            offLoader();
        }
    })

    //Add a new photo Identity
    $(".add_photo").on("click", function(e) {
        e.preventDefault()
        $('#file').trigger('click');

    })



    //Logout User
    $(document).on("click", ".logout_user", function(e) {
        e.preventDefault();
        onLoader()
        swal({
                title: "Are you sure?",
                text: "You are about to logout",
                icon: "warning",
                buttons: true,
                dangerMode: true,
            })
            .then((willDelete) => {
                if (willDelete) {
                    firebase.auth().signOut().then(function() {
                        goto("index")
                        swal("Seek you soon!");
                    }).catch(function(error) {
                        console.log(error);
                    });
                } else {
                    swal("Great!");
                }
            });

    })

    //Show Panel for Users
    $(document).on("click", ".peeps", function(e) {
        e.preventDefault()
        let id = $(this).attr("id");
        if (id == 0) {
            $("#users").removeClass("hidden");
            $("#account").addClass("hidden");            
        } else {
            $("#users").addClass("hidden");
            $("#account").removeClass("hidden");
        }
        $('.peeps').removeClass('selected');
        $(this).addClass('selected')
    })


    //Get SSN
    $(document).on("click", ".reveal_ssn", function(e) {
        e.preventDefault();
        let id = $(this).attr("id");
        onLoader();
        let getSSN = firebase.functions().httpsCallable("getSSN");
        getSSN({id}).then(function(r) {
            r = r.data
            if (r.success == 1) {
                swal({
                    title: "SSN REVEALED",
                    text: r.message,
                    icon: "success",
                    button: "Ok",
                });
                offLoader();
            } else {
                swal({
                    title: "Error",
                    text: r.message,
                    icon: "error",
                    button: "Ouch! Re-try",
                });
                offLoader();
            }

        })


    })


    //Make Admin
    $(document).on("click", ".make_admin", function(e) {
        e.preventDefault();
        let user = $(this).attr("id");
        onLoader();
        let self = $(this)
        let makeAdmin = firebase.functions().httpsCallable("makeAdmin");
        makeAdmin({
            user
        }).then(function(r) {
         
            r = r.data
            if (r.success == 1) {
                self.addClass("remove_admin").addClass("redu").removeClass("make_admin").removeClass("greenu").html("Remove as Admin")
                swal({
                    title: "Great!",
                    text: r.message,
                    icon: "success",
                    button: "Ok",
                });
                offLoader();
            } else {
                swal({
                    title: "Sign-Up Error",
                    text: r.message,
                    icon: "error",
                    button: "Ouch! Re-try",
                });
                offLoader();
            }

        })

    })


    //Remove Admin
    $(document).on("click", ".remove_admin", function(e) {
        e.preventDefault();
        onLoader()
        let user = $(this).attr("id");
        let removeAdmin = firebase.functions().httpsCallable("unMakeAdmin");
        let self = $(this)
        removeAdmin({
            user
        }).then(function(r) {
      
            r = r.data
            if (r.success == 1) {
                self.addClass("make_admin").addClass("greenu").removeClass("remove_admin").removeClass("redu").html("Make Admin")
                offLoader();
                swal({
                    title: "Great!",
                    text: r.message,
                    icon: "success",
                    button: "Ok",
                });
            } else {
                swal({
                    title: "Error",
                    text: r.message,
                    icon: "error",
                    button: "Ouch! Re-try",
                });
                offLoader();
            }

        })

    })

    //Upload selected new identity photo
    $("#file").change(function() {

        var fileName = $("#file").val();
        onLoader()
        if (fileName) {
            let timestamp = (Date.now() / 1000 | 0).toString();
            let api_key = '739168487851861'
            let api_secret = '6GmBybnXcVhcCCO-c33DLwP9o_U'
            let cloud = "ddr4wic7z"
            let hash_string = 'timestamp=' + timestamp + api_secret
            let upload_url = 'https://api.cloudinary.com/v1_1/' + cloud + '/image/upload';
            let data = new FormData();
            let file_d = $('#file')[0].files

            $.each($('#file')[0].files, function(i, file) {
                data.append('file', file);
            });
            data.append('timestamp', timestamp);
            data.append('api_key', api_key);
            data.append('api_secret', api_secret);
            data.append('cloud_name', cloud);
            data.append('upload_preset', "icbrvzbm");
            $.ajax({
                url: upload_url,
                data: data,
                cache: false,
                contentType: false,
                processData: false,
                method: 'POST',
                type: 'POST',
                success: function(data) {
                    $(".prof_pic").attr("src", data.url);
                    $("#newphoto").val(data.url);

                   
                    let uploadPhoto = firebase.functions().httpsCallable("uploadPhoto");
                    uploadPhoto({
                        photo: data.url
                    }).then(function(r) {
                        r = r.data
                        if (r.success == 1) {
                            offLoader();
                            swal({
                                title: "Great!",
                                text: r.message,
                                icon: "success",
                                button: "Ok",
                            });
                        } else {
                            swal({
                                title: "Error",
                                text: r.message,
                                icon: "error",
                                button: "Okay",
                            });
                            offLoader();
                        }

                    })

                }
            });
        }

    });

})




//Redirect to Page
function goto(target) {
    window.location.href = '/' + target
}

//Abbreviate The Long Ass Numbers
function abbreviateNumber(number) {

    var SI_SYMBOL = ["", "k", "M", "G", "T", "P", "E"];

    var tier = Math.log10(number) / 3 | 0;

    if (tier == 0) return number;

    var suffix = SI_SYMBOL[tier];
    var scale = Math.pow(10, tier * 3);

    var scaled = number / scale;

    return scaled.toFixed(1) + suffix;
}



function checkAuthentication(x = 'none') {
    onLoader();
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            guid = user.uid
            if (x !== "none") {
                let func = x + "()";
                eval(func)
            } else {
                offLoader();
            }
        } else {

            if (x !== "none") {
                let func = x + "()";
                eval(func)
            } else {
                goto('index')
            }
        }
    });

}


//SHow the Loader
function onLoader() {
    let loader = `<div class='loader'>
    <img src='./img/loading.gif' class='loading'/>
  </div>`;
    $("body").append(loader)
}

//Turn Off Loader
function offLoader() {
    $(".loader").remove()
}


//Get my Profile
function getProfileInfo() {
    let profile = firebase.functions().httpsCallable("getMyInfo");
    profile().then(function(r) {
        r = r.data
    
        let data = r.data
        let all = r.all
        $("#address").val(data.address);
        $("#telephone").val(data.tele);
        $("#firstname").val(data.firstname);
        $("#lastname").val(data.lastname);
        $("#email").val(data.email);
        $("#myname").html(data.firstname + " " + data.lastname);
        $("#mybalance").html("Your available balance is $" + data.balance);
        $("#myphoto").attr("src",data.photo)

        if (r.success == 1) {
            offLoader();
            if (all !== null) {
                $(".header").prepend(`
                    <a href='#!' class='footer_btn line_v selected peeps' id='1'> <span class='text'> MY ACCOUNT </span> </a>
                    <a href='#!' class='footer_btn line_v peeps' id='0'> <span class='text '> WORKERS </span> </a>`).removeClass('hidden')
                all.forEach((d) => {
                    let btn = `<a href='#!' class='action greenu make_admin' id='${d.uid}'> Make Admin </a>`
                    if (d.admin == true) {
                        btn = `<a href='#!' class='action redu remove_admin' id='${d.uid}'> Remove As Admin </a>`
                    }

                    let msg = `<div class='user'>
                        <div class='dp_cont'>
                          <img src='${d.photo}' class='dp'/>
                        </div>
                        <div class='user_details'>
                          <span class='titler'> ${d.firstname +' '+d.lastname} </span>
                          <span class='telephone'> ${d.tele} </span>
                          <span class='address'> ${d.address} </span>
                          <a href='#!' class='action blueu reveal_ssn' id='${d.uid}'> Reveal SSN </a>
                          ${btn}
                        </div>

                      </div>`;
                    $(".scroll").append(msg)
                });
                if (all.length == 0) {
                    $(".scroll").append("No users yet!")
                }
            }


        } else {
            swal({
                title: "Sign-Up Error",
                text: r.message,
                icon: "error",
                button: "Ouch! Re-try",
            });
            offLoader();
        }

    })
}

function blank()
{
  console.log("Empty Function")
  offLoader();
}

offLoader();