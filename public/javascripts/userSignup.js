
var resetFormData = () => {
    $("#s_accountId").val('');
    $("#s_password").val('');
    $("#accountMailid").val('');
    $("#s_rpassword").val('');
    $("#s_mobilenumber").val('');
    $("#s_dob").val('');        
    $("#s_address").val('');

    // $("#signupMsg").hide();
    $("#s_accountId").focus();
}

var doUserSignup = () => {
    var userDetails = {};
    userDetails.accountId = $("#s_accountId").val();
    userDetails.password = $("#s_password").val();
    userDetails.mailId = $("#accountMailid").val();
    userDetails.mobileNumber = $("#s_mobilenumber").val();
    userDetails.dob = $("#s_dob").val();
    userDetails.address = $("#s_address").val();
    userDetails.rpassword = $("#s_rpassword").val();


    // Client-side validation for required fields
    if (!userDetails.mailId || !userDetails.password || !userDetails.mobileNumber) {
        $("#signupMsg").show();
        $("#signupMsg span").text("All fields are required: email, password, and mobile.");
        $("#signupMsg span").addClass("error-message");
        return;
    }

    // Client-side validation for DOB (no future date)
    if (userDetails.dob) {
        var dobDate = new Date(userDetails.dob);
        var now = new Date();
        if (dobDate > now) {
            $("#signupMsg").show();
            $("#signupMsg span").text("Date of Birth cannot be in the future.");
            $("#signupMsg span").addClass("error-message");
            return;
        }
    }

    axios.post('/newUserSignup/register', {
        email: userDetails.mailId,
        password: userDetails.password,
        mobile: userDetails.mobileNumber,
        accountId: userDetails.accountId,
        dob: userDetails.dob,
        address: userDetails.address,
        rpassword: userDetails.rpassword
    }).then((result) => {
        $("#signupMsg").show();
        $("#signupMsg span").removeClass("error-message");
        if (result.data.msg == 'Done') {
            $("#signupMsg span").text("Signed up Successfully");
            resetFormData();
        } else {
            $("#signupMsg span").text(result.data.msg || "Error while doing signup");
            $("#signupMsg span").addClass("error-message");
        }
    }).catch((err) => {
        // Show backend error for DOB or other errors
        let msg = "Error while doing signup";
        if (err.response && err.response.data) {
            try {
                const data = typeof err.response.data === 'string' ? JSON.parse(err.response.data) : err.response.data;
                if (data.msg) msg = data.msg;
            } catch(e) {}
        }
        $("#signupMsg").show();
        $("#signupMsg span").text(msg);
        $("#signupMsg span").addClass("error-message");
    });
}